// Twitter Authentication and Verification System for SPLIT
// Mandatory Twitter linking to prevent bot interference

import { supabase } from './supabase';
import { generateNonce } from './utils';

export interface TwitterProfile {
  id: string;
  username: string;
  name: string;
  profile_image_url: string;
  description?: string;
  location?: string;
  url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
}

export interface TwitterVerificationResult {
  success: boolean;
  profile?: TwitterProfile;
  error?: string;
  verificationToken?: string;
}

// Step 1: Generate verification challenge for wallet
export async function generateTwitterVerification(walletAddress: string): Promise<{
  verificationToken: string;
  tweetText: string;
  expiresAt: Date;
}> {
  const verificationToken = generateNonce();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // Store verification token in database
  await supabase
    .from('profiles')
    .upsert({
      wallet_address: walletAddress,
      twitter_verification_token: verificationToken,
      twitter_verification_expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'wallet_address'
    });

  const tweetText = `Verifying my wallet for @SplitSquads 🎮\n\nWallet: ${walletAddress}\nCode: ${verificationToken}\n\n#SplitOrSteal #Solana`;

  return {
    verificationToken,
    tweetText,
    expiresAt,
  };
}

// Step 2: Verify Twitter account by checking tweet
export async function verifyTwitterAccount(
  walletAddress: string,
  twitterHandle: string,
  tweetUrl: string
): Promise<TwitterVerificationResult> {
  try {
    // Extract tweet ID from URL
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      return { success: false, error: 'Invalid tweet URL' };
    }

    // Get stored verification token
    const { data: profile } = await supabase
      .from('profiles')
      .select('twitter_verification_token, twitter_verification_expires_at')
      .eq('wallet_address', walletAddress)
      .single();

    if (!profile?.twitter_verification_token) {
      return { success: false, error: 'No verification token found. Please start verification process.' };
    }

    // Check if token expired
    if (new Date() > new Date(profile.twitter_verification_expires_at)) {
      return { success: false, error: 'Verification token expired. Please start over.' };
    }

    // Fetch Twitter profile and tweet (using Twitter API v2)
    const twitterProfile = await fetchTwitterProfile(twitterHandle);
    if (!twitterProfile) {
      return { success: false, error: 'Twitter profile not found' };
    }

    const tweetContent = await fetchTweetContent(tweetId);
    if (!tweetContent) {
      return { success: false, error: 'Tweet not found or not accessible' };
    }

    // Verify tweet contains wallet address and verification token
    const containsWallet = tweetContent.includes(walletAddress);
    const containsToken = tweetContent.includes(profile.twitter_verification_token);
    const isTweetByUser = tweetContent.includes(`@${twitterHandle}`) || await verifyTweetAuthor(tweetId, twitterProfile.id);

    if (!containsWallet || !containsToken || !isTweetByUser) {
      return { 
        success: false, 
        error: 'Tweet verification failed. Make sure the tweet contains your wallet address and verification code.' 
      };
    }

    // Anti-bot checks
    const botCheckResult = await performBotChecks(twitterProfile);
    if (!botCheckResult.passed) {
      return { 
        success: false, 
        error: `Account verification failed: ${botCheckResult.reason}` 
      };
    }

    // Update profile with verified Twitter info
    await supabase
      .from('profiles')
      .update({
        twitter_handle: twitterHandle,
        twitter_id: twitterProfile.id,
        twitter_verified: true,
        display_name: twitterProfile.name,
        avatar_url: twitterProfile.profile_image_url,
        bio: twitterProfile.description,
        location: twitterProfile.location,
        website: twitterProfile.url,
        twitter_verification_token: null, // Clear token after successful verification
        twitter_verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress);

    // Log verification for audit trail
    await supabase
      .from('twitter_verifications')
      .insert({
        profile_id: (await getProfileId(walletAddress))!,
        wallet_address: walletAddress,
        twitter_handle: twitterHandle,
        twitter_id: twitterProfile.id,
        verification_tweet_id: tweetId,
        verification_method: 'tweet_proof',
      });

    return {
      success: true,
      profile: twitterProfile,
    };

  } catch (error) {
    console.error('Twitter verification error:', error);
    return { 
      success: false, 
      error: 'Verification failed. Please try again.' 
    };
  }
}

// Step 3: OAuth-based Twitter verification (alternative method)
export async function initiateTwitterOAuth(walletAddress: string): Promise<{
  authUrl: string;
  state: string;
}> {
  const state = generateNonce();
  
  // Store state for verification
  await supabase
    .from('profiles')
    .upsert({
      wallet_address: walletAddress,
      twitter_verification_token: state,
      twitter_verification_expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }, {
      onConflict: 'wallet_address'
    });

  const authUrl = `https://twitter.com/i/oauth2/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI!)}&` +
    `scope=tweet.read%20users.read&` +
    `state=${state}&` +
    `code_challenge=challenge&` +
    `code_challenge_method=plain`;

  return { authUrl, state };
}

// Helper functions
function extractTweetId(tweetUrl: string): string | null {
  const match = tweetUrl.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchTwitterProfile(username: string): Promise<TwitterProfile | null> {
  // In production, this would call Twitter API v2
  // For development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return {
      id: '123456789',
      username: username.replace('@', ''),
      name: 'Mock User',
      profile_image_url: 'https://via.placeholder.com/400x400',
      description: 'Mock Twitter profile for development',
      public_metrics: {
        followers_count: 100,
        following_count: 50,
        tweet_count: 1000,
      }
    };
  }

  try {
    const response = await fetch(`/api/twitter/profile/${username}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Twitter profile');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Twitter profile:', error);
    return null;
  }
}

async function fetchTweetContent(tweetId: string): Promise<string | null> {
  // In production, this would call Twitter API v2
  // For development, return mock tweet content
  if (process.env.NODE_ENV === 'development') {
    return `Verifying my wallet for @SplitSquads 🎮

Wallet: mockwallet123
Code: mock-verification-token

#SplitOrSteal #Solana`;
  }

  try {
    const response = await fetch(`/api/twitter/tweet/${tweetId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch tweet');
    }
    
    const data = await response.json();
    return data.data.text;
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return null;
  }
}

async function verifyTweetAuthor(tweetId: string, userId: string): Promise<boolean> {
  // Verify that the tweet was authored by the claimed user
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  try {
    const response = await fetch(`/api/twitter/tweet/${tweetId}?expansions=author_id`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.data.author_id === userId;
  } catch (error) {
    console.error('Error verifying tweet author:', error);
    return false;
  }
}

// Anti-bot detection checks
async function performBotChecks(profile: TwitterProfile): Promise<{
  passed: boolean;
  reason?: string;
}> {
  const checks = [];

  // Check 1: Account age (must be at least 30 days old)
  // This would require additional API call to get account creation date
  
  // Check 2: Minimum followers (configurable threshold)
  const minFollowers = parseInt(process.env.MIN_TWITTER_FOLLOWERS || '10');
  if (profile.public_metrics && profile.public_metrics.followers_count < minFollowers) {
    return { 
      passed: false, 
      reason: `Account must have at least ${minFollowers} followers` 
    };
  }

  // Check 3: Minimum tweets
  const minTweets = parseInt(process.env.MIN_TWITTER_TWEETS || '5');
  if (profile.public_metrics && profile.public_metrics.tweet_count < minTweets) {
    return { 
      passed: false, 
      reason: `Account must have at least ${minTweets} tweets` 
    };
  }

  // Check 4: Profile completeness
  if (!profile.description || profile.description.length < 10) {
    return { 
      passed: false, 
      reason: 'Profile must have a meaningful bio/description' 
    };
  }

  // Check 5: Suspicious patterns (would be more sophisticated in production)
  const suspiciousPatterns = [
    /bot/i,
    /automated/i,
    /\d{8,}$/, // Username ending with many digits
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(profile.username) || pattern.test(profile.name))) {
    return { 
      passed: false, 
      reason: 'Account appears to be automated' 
    };
  }

  return { passed: true };
}

async function getProfileId(walletAddress: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', walletAddress)
    .single();
  
  return data?.id || null;
}

// Check if wallet already has verified Twitter
export async function checkTwitterVerification(walletAddress: string): Promise<{
  isVerified: boolean;
  twitterHandle?: string;
  profile?: any;
}> {
  const { data } = await supabase
    .from('profiles')
    .select('twitter_verified, twitter_handle, display_name, avatar_url')
    .eq('wallet_address', walletAddress)
    .single();

  return {
    isVerified: data?.twitter_verified || false,
    twitterHandle: data?.twitter_handle,
    profile: data,
  };
}
