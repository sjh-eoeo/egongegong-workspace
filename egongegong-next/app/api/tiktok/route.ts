import { NextResponse } from 'next/server';
import { fetchCreatorMetrics, fetchTikTokUser } from '@/services/tokApiService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ 
      error: 'Missing username parameter',
      usage: '/api/tiktok?username=@creator_handle'
    }, { status: 400 });
  }

  // Check if RAPIDAPI_KEY is configured
  if (!process.env.NEXT_PUBLIC_RAPIDAPI_KEY) {
    return NextResponse.json({ 
      error: 'RAPIDAPI_KEY not configured',
      message: 'Add NEXT_PUBLIC_RAPIDAPI_KEY to .env.local'
    }, { status: 500 });
  }

  try {
    const metrics = await fetchCreatorMetrics(username);

    if (!metrics) {
      return NextResponse.json({ 
        error: 'User not found or API error',
        username 
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'ok',
      username,
      user: {
        id: metrics.user.id,
        handle: '@' + metrics.user.uniqueId,
        name: metrics.user.nickname,
        avatar: metrics.user.avatarThumb,
        verified: metrics.user.verified,
        bio: metrics.user.signature,
      },
      stats: {
        followers: metrics.user.followerCount,
        following: metrics.user.followingCount,
        totalLikes: metrics.user.heartCount,
        videoCount: metrics.user.videoCount,
      },
      metrics: {
        avgViews: metrics.avgViews,
        avgLikes: metrics.avgLikes,
        avgComments: metrics.avgComments,
        avgShares: metrics.avgShares,
        engagementRate: metrics.engagementRate,
      },
      recentVideosCount: metrics.recentVideos.length,
    });
  } catch (error) {
    console.error('[TikTok API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
