import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { generateNonce } from '@/lib/utils';

const createProofSchema = z.object({
  walletAddress: z.string().min(32).max(44),
});

const verifyProofSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  tweetUrl: z.string().url(),
  nonce: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = createProofSchema.parse(body);

    // Generate a new nonce
    const nonce = generateNonce();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store the proof attempt
    const { data: _data, error } = await supabase
      .from('twitter_proofs')
      .insert({
        wallet_address: walletAddress,
        nonce,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create proof attempt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      nonce,
      message: `Verify your wallet by tweeting: "Verifying my wallet ${walletAddress} on @SplitSquads with nonce: ${nonce}"`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, tweetUrl, nonce } = verifyProofSchema.parse(body);

    // Verify the nonce exists and hasn't expired
    const { data: proofAttempt, error: proofError } = await supabase
      .from('twitter_proofs')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('nonce', nonce)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (proofError || !proofAttempt) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      );
    }

    // Extract tweet ID from URL
    const tweetIdMatch = tweetUrl.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) {
      return NextResponse.json(
        { error: 'Invalid tweet URL' },
        { status: 400 }
      );
    }

    // In a real implementation, you would fetch the tweet content here
    // For demo purposes, we'll simulate verification
    const tweetVerified = await verifyTweetContent(tweetUrl, walletAddress, nonce);

    if (!tweetVerified.success) {
      return NextResponse.json(
        { error: tweetVerified.error || 'Tweet verification failed' },
        { status: 400 }
      );
    }

    // Update the proof as verified
    const { error: updateError } = await supabase
      .from('twitter_proofs')
      .update({
        tweet_url: tweetUrl,
        verified: true,
      })
      .eq('id', proofAttempt.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update proof' },
        { status: 500 }
      );
    }

    // Update user profile with Twitter info
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        wallet_address: walletAddress,
        twitter_handle: tweetVerified.handle,
        twitter_profile_url: tweetVerified.profileUrl,
        twitter_verified: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Failed to update user profile:', profileError);
    }

    return NextResponse.json({
      success: true,
      twitterHandle: tweetVerified.handle,
      profileUrl: tweetVerified.profileUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock tweet verification function
// In production, this would use Twitter API or web scraping
async function verifyTweetContent(
  tweetUrl: string,
  walletAddress: string,
  nonce: string
): Promise<{ success: boolean; handle?: string; profileUrl?: string; error?: string }> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract username from URL
    const usernameMatch = tweetUrl.match(/twitter\.com\/([^\/]+)\/status/);
    if (!usernameMatch) {
      return { success: false, error: 'Could not extract username from URL' };
    }

    const username = usernameMatch[1];
    
    // In a real implementation, you would:
    // 1. Fetch the tweet content
    // 2. Check if it contains the wallet address and nonce
    // 3. Verify the tweet is recent (within expiration time)
    
    // For demo purposes, we'll simulate successful verification
    const handle = `@${username}`;
    const profileUrl = `https://twitter.com/${username}`;

    // Simulate tweet content check
    const _expectedContent = `Verifying my wallet ${walletAddress} on @SplitSquads with nonce: ${nonce}`;
    
    // Mock verification - in reality you'd check the actual tweet content
    return {
      success: true,
      handle,
      profileUrl,
    };
  } catch (error) {
    return { success: false, error: 'Failed to verify tweet' };
  }
}