/**
 * TokAPI Service - TikTok Creator Metrics via RapidAPI
 * 
 * API: https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7
 * 
 * 사용 전 환경변수 설정 필요:
 * - NEXT_PUBLIC_RAPIDAPI_KEY: RapidAPI 키
 */

const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

export interface TikTokUserInfo {
  id: string;
  uniqueId: string; // @handle
  nickname: string;
  avatarThumb: string;
  signature: string;
  verified: boolean;
  followerCount: number;
  followingCount: number;
  heartCount: number; // Total likes
  videoCount: number;
  diggCount: number; // Videos user liked
}

export interface TikTokVideoInfo {
  id: string;
  desc: string;
  createTime: number;
  duration: number;
  playCount: number;
  diggCount: number; // likes
  commentCount: number;
  shareCount: number;
  collectCount: number;
  downloadUrl: string;
  coverUrl: string;
}

export interface TikTokMetricsResult {
  user: TikTokUserInfo;
  recentVideos: TikTokVideoInfo[];
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  engagementRate: number;
}

/**
 * Fetch TikTok user info by username
 */
export async function fetchTikTokUser(username: string): Promise<TikTokUserInfo | null> {
  if (!RAPIDAPI_KEY) {
    console.error('[TokAPI] RAPIDAPI_KEY not configured');
    return null;
  }

  // Remove @ if present
  const cleanUsername = username.replace('@', '');

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/user/info?unique_id=${cleanUsername}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.code !== 0 || !data.data?.user) {
      console.error('[TokAPI] Invalid response:', data);
      return null;
    }

    const user = data.data.user;
    const stats = data.data.stats;

    return {
      id: user.id,
      uniqueId: user.uniqueId,
      nickname: user.nickname,
      avatarThumb: user.avatarThumb,
      signature: user.signature || '',
      verified: user.verified || false,
      followerCount: stats?.followerCount || 0,
      followingCount: stats?.followingCount || 0,
      heartCount: stats?.heartCount || 0,
      videoCount: stats?.videoCount || 0,
      diggCount: stats?.diggCount || 0,
    };
  } catch (error) {
    console.error('[TokAPI] fetchTikTokUser error:', error);
    return null;
  }
}

/**
 * Fetch recent videos for a TikTok user
 */
export async function fetchTikTokVideos(username: string, count = 10): Promise<TikTokVideoInfo[]> {
  if (!RAPIDAPI_KEY) {
    console.error('[TokAPI] RAPIDAPI_KEY not configured');
    return [];
  }

  const cleanUsername = username.replace('@', '');

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/user/posts?unique_id=${cleanUsername}&count=${count}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data?.videos) {
      console.error('[TokAPI] Invalid response:', data);
      return [];
    }

    return data.data.videos.map((v: Record<string, unknown>) => ({
      id: v.video_id || v.id,
      desc: v.title || '',
      createTime: v.create_time || 0,
      duration: v.duration || 0,
      playCount: v.play_count || 0,
      diggCount: v.digg_count || 0,
      commentCount: v.comment_count || 0,
      shareCount: v.share_count || 0,
      collectCount: v.collect_count || 0,
      downloadUrl: v.play || '',
      coverUrl: v.cover || '',
    }));
  } catch (error) {
    console.error('[TokAPI] fetchTikTokVideos error:', error);
    return [];
  }
}

/**
 * Fetch full metrics for a TikTok creator
 */
export async function fetchCreatorMetrics(username: string): Promise<TikTokMetricsResult | null> {
  const user = await fetchTikTokUser(username);
  if (!user) return null;

  const recentVideos = await fetchTikTokVideos(username, 30);

  // Calculate averages
  const videoCount = recentVideos.length || 1;
  const avgViews = recentVideos.reduce((sum, v) => sum + v.playCount, 0) / videoCount;
  const avgLikes = recentVideos.reduce((sum, v) => sum + v.diggCount, 0) / videoCount;
  const avgComments = recentVideos.reduce((sum, v) => sum + v.commentCount, 0) / videoCount;
  const avgShares = recentVideos.reduce((sum, v) => sum + v.shareCount, 0) / videoCount;

  // Engagement Rate = (likes + comments + shares) / views * 100
  const totalEngagement = avgLikes + avgComments + avgShares;
  const engagementRate = avgViews > 0 ? (totalEngagement / avgViews) * 100 : 0;

  return {
    user,
    recentVideos,
    avgViews: Math.round(avgViews),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgShares: Math.round(avgShares),
    engagementRate: Math.round(engagementRate * 100) / 100, // 2 decimal places
  };
}

/**
 * Batch update metrics for multiple creators
 */
export async function batchFetchMetrics(
  usernames: string[],
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, TikTokMetricsResult | null>> {
  const results = new Map<string, TikTokMetricsResult | null>();
  
  for (let i = 0; i < usernames.length; i++) {
    const username = usernames[i];
    onProgress?.(i + 1, usernames.length);
    
    const metrics = await fetchCreatorMetrics(username);
    results.set(username, metrics);
    
    // Rate limiting: wait 500ms between requests
    if (i < usernames.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}
