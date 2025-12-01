import { NextRequest, NextResponse } from 'next/server';
import { AirtableInfluencer } from '@/services/airtableService';

// Airtable에서 데이터 가져오기
async function fetchFromAirtable(limit: number = 100) {
  const token = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appgQd2ROl1QfZKi3';
  const tableName = 'Influencers';

  if (!token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const allRecords: AirtableInfluencer[] = [];
  let offset: string | undefined;

  do {
    let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${Math.min(limit, 100)}`;
    if (offset) {
      url += `&offset=${offset}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    for (const record of data.records) {
      const fields = record.fields;
      allRecords.push({
        id: record.id,
        account: fields['Influencer Account'] || '',
        tiktokProfileLink: fields['TIKTOK PROFILE LINK'],
        email: fields['Email'],
        followers: fields['Followers'],
        maxViews: fields['MAX Views'],
        averageViews5: fields['5_average'],
        medianViews20: fields['20_median'],
        averageViews20: fields['20_average'],
        followersDistribution: fields['Followers 분포'],
        collabCount: fields['Collab Count'],
        averageRate: fields['Average Rate'],
      });
    }

    offset = data.offset;
    
    // Rate limiting
    if (offset && allRecords.length < limit) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } while (offset && allRecords.length < limit);

  return allRecords.slice(0, limit);
}

// Airtable 데이터를 앱에서 사용할 형식으로 변환
function mapToInfluencer(airtable: AirtableInfluencer) {
  const handle = airtable.account ? `@${airtable.account.replace('@', '')}` : '@unknown';
  
  // Followers 분포에서 주요 국가 추출 ("US: 83%, DE: 5%" -> "US")
  const countryMatch = airtable.followersDistribution?.match(/^([A-Z]{2}):/);
  const country = countryMatch ? countryMatch[1] : 'US';
  
  return {
    airtableId: airtable.id,
    handle,
    name: airtable.account || 'Unknown',
    email: airtable.email || '',
    tiktokProfileLink: airtable.tiktokProfileLink || `https://tiktok.com/${handle}`,
    followerCount: airtable.followers || 0,
    country,
    followersDistribution: airtable.followersDistribution || '',
    
    metrics: {
      views: airtable.averageViews20 || 0,
      maxViews: airtable.maxViews || 0,
      avgViewsPerVideo: airtable.averageViews5 || 0,
      medianViews: airtable.medianViews20 || 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0,
    },
    
    collabCount: airtable.collabCount || 0,
    averageRate: airtable.averageRate || 0,
    
    status: 'Discovery',
    category: '',
    agreedAmount: 0,
    currency: 'USD',
    paymentStatus: 'Unpaid',
  };
}

// GET - Airtable에서 데이터 가져와서 앱 형식으로 반환 (Firestore 저장은 클라이언트에서)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const airtableData = await fetchFromAirtable(limit);
    
    const mapped = airtableData
      .filter(r => r.account) // account 없는 것 제외
      .map(mapToInfluencer);

    return NextResponse.json({
      success: true,
      total: mapped.length,
      data: mapped,
    });

  } catch (error) {
    console.error('Airtable fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch from Airtable' },
      { status: 500 }
    );
  }
}
