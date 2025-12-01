import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchInfluencersByAccounts,
  createInfluencerInAirtable,
  updateInfluencerInAirtable,
  deleteInfluencerFromAirtable,
  batchCreateInfluencersInAirtable,
  batchUpdateInfluencersInAirtable,
  AirtableInfluencerInput
} from '@/services/airtableService';

// 직접 Airtable API 호출 (단순화된 읽기)
async function fetchAirtableRecords(limit: number = 3, account?: string) {
  const token = process.env.AIRTABLE_API_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appgQd2ROl1QfZKi3';
  const tableName = 'Influencers';

  if (!token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  let url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=${limit}`;
  
  if (account) {
    const formula = `{Influencer Account}='${account.replace(/'/g, "\\'")}'`;
    url += `&filterByFormula=${encodeURIComponent(formula)}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// GET - 읽기
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const account = searchParams.get('account') || undefined;

  try {
    const data = await fetchAirtableRecords(Math.min(limit, 100), account);
    
    return NextResponse.json({
      success: true,
      total: data.records?.length || 0,
      data: data.records?.map((r: { id: string; fields: Record<string, unknown> }) => ({
        id: r.id,
        account: r.fields['Influencer Account'],
        email: r.fields['Email'],
        followers: r.fields['Followers'],
        maxViews: r.fields['MAX Views'],
        averageViews5: r.fields['5_average'],
        medianViews20: r.fields['20_median'],
        averageViews20: r.fields['20_average'],
        followersDistribution: r.fields['Followers 분포'],
        tiktokLink: r.fields['TIKTOK PROFILE LINK'],
        collabCount: r.fields['Collab Count'],
        averageRate: r.fields['Average Rate'],
      })) || [],
    });
  } catch (error) {
    console.error('Airtable GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 일괄 생성
    if (Array.isArray(body.records)) {
      const results = await batchCreateInfluencersInAirtable(body.records as AirtableInfluencerInput[]);
      return NextResponse.json({ success: true, created: results.length, data: results });
    }
    
    // 단일 생성
    const result = await createInfluencerInAirtable(body as AirtableInfluencerInput);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Airtable POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH - 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 일괄 업데이트
    if (Array.isArray(body.records)) {
      const updates = body.records as Array<{ id: string; data: Partial<AirtableInfluencerInput> }>;
      const results = await batchUpdateInfluencersInAirtable(updates);
      return NextResponse.json({ success: true, updated: results.length, data: results });
    }
    
    // 단일 업데이트
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
    }
    
    const result = await updateInfluencerInAirtable(id, data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Airtable PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - 삭제
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
  }

  try {
    await deleteInfluencerFromAirtable(id);
    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Airtable DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
