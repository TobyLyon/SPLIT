import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';
import nacl from 'tweetnacl';

const updateScoreSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  squadPubkey: z.string().min(32).max(44).optional(),
  score: z.number().int().min(0).max(100),
  signature: z.string(),
  timestamp: z.number(),
});

// Oracle public key - in production this would be stored securely
const ORACLE_PUBLIC_KEY = process.env.ORACLE_PUBLIC_KEY || 'your-oracle-public-key-here';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, squadPubkey, score, signature, timestamp } = updateScoreSchema.parse(body);

    // Verify the request is recent (within 5 minutes)
    const now = Date.now();
    if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: 'Request timestamp too old' },
        { status: 400 }
      );
    }

    // Verify the signature
    const message = `${walletAddress}:${squadPubkey || ''}:${score}:${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Buffer.from(signature, 'base64');
    const oraclePublicKeyBytes = new PublicKey(ORACLE_PUBLIC_KEY).toBytes();

    const isValidSignature = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      oraclePublicKeyBytes
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid oracle signature' },
        { status: 403 }
      );
    }

    // Get current score for logging
    const { data: currentScore } = await supabase
      .from('activity_scores')
      .select('score')
      .eq('wallet_address', walletAddress)
      .eq('squad_pubkey', squadPubkey || '')
      .single();

    // Update the activity score
    const { data: updatedScore, error: updateError } = await supabase
      .from('activity_scores')
      .upsert({
        wallet_address: walletAddress,
        squad_pubkey: squadPubkey,
        score,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update activity score' },
        { status: 500 }
      );
    }

    // Log the oracle update
    const { error: logError } = await supabase
      .from('oracle_updates')
      .insert({
        wallet_address: walletAddress,
        squad_pubkey: squadPubkey,
        old_score: currentScore?.score || 0,
        new_score: score,
        signature,
      });

    if (logError) {
      console.error('Failed to log oracle update:', logError);
    }

    return NextResponse.json({
      success: true,
      walletAddress,
      squadPubkey,
      oldScore: currentScore?.score || 0,
      newScore: score,
      updatedAt: updatedScore.updated_at,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Oracle update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const squadPubkey = searchParams.get('squad');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('activity_scores')
      .select('*')
      .eq('wallet_address', walletAddress);

    if (squadPubkey) {
      query = query.eq('squad_pubkey', squadPubkey);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch activity scores' },
        { status: 500 }
      );
    }

    return NextResponse.json({ scores: data });
  } catch (error) {
    console.error('Get activity scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Utility endpoint for oracle health check
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}