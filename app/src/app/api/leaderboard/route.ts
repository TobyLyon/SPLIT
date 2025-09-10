import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const leaderboardQuerySchema = z.object({
  type: z.enum(['squad', 'member', 'all']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      type: searchParams.get('type') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const { type, limit, offset } = leaderboardQuerySchema.parse(rawQuery);

    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .range(offset, offset + limit - 1);

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq(type !== 'all' ? 'type' : 'id', type !== 'all' ? type : '');

    return NextResponse.json({
      entries: data,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update leaderboard entries (called by background jobs)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = z.array(z.object({
      type: z.enum(['squad', 'member']),
      pubkey: z.string(),
      name: z.string(),
      total_staked: z.number().int().min(0),
      member_count: z.number().int().min(0).optional(),
      twitter_handle: z.string().optional(),
    })).parse(body);

    // Verify API key for background job access
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.BACKGROUND_JOB_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update leaderboard entries
    const { error } = await supabase
      .from('leaderboard')
      .upsert(
        entries.map(entry => ({
          ...entry,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'type,pubkey' }
      );

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update leaderboard' },
        { status: 500 }
      );
    }

    // Recalculate rankings
    const { error: rankError } = await supabase.rpc('update_leaderboard_rankings');

    if (rankError) {
      console.error('Failed to update rankings:', rankError);
      return NextResponse.json(
        { error: 'Failed to update rankings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: entries.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Leaderboard update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}