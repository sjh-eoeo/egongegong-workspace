/**
 * Airtable Service - Influencer 데이터를 Airtable에서 읽기/쓰기
 * 
 * 구글 스프레드시트 앱스크립트에서 사용하던 방식을 Next.js로 포팅
 */

// 환경변수에서 읽어오기 (서버사이드에서만 사용)
const getAirtableConfig = () => ({
  token: process.env.AIRTABLE_API_TOKEN || '',
  baseId: process.env.AIRTABLE_BASE_ID || 'appgQd2ROl1QfZKi3',
  tableName: process.env.AIRTABLE_TABLE_NAME || 'Influencers',
});

export interface AirtableInfluencer {
  id: string;
  account: string;
  tiktokProfileLink?: string;
  email?: string;
  followers?: number;
  maxViews?: number;
  averageViews5?: number;
  medianViews20?: number;
  averageViews20?: number;
  followersDistribution?: string;
  collabCount?: number;
  averageRate?: number;
}

// 쓰기용 인터페이스 (id 제외)
export interface AirtableInfluencerInput {
  account: string;
  tiktokProfileLink?: string;
  email?: string;
  followers?: number;
  maxViews?: number;
  averageViews5?: number;
  medianViews20?: number;
  averageViews20?: number;
  followersDistribution?: string;
  collabCount?: number;
  averageRate?: number;
}

interface AirtableRecord {
  id: string;
  fields: {
    'Influencer Account'?: string;
    'TIKTOK PROFILE LINK'?: string;
    'Email'?: string;
    'Followers'?: number;
    'MAX Views'?: number;
    '5_average'?: number;
    '20_median'?: number;
    '20_average'?: number;
    'Followers 분포'?: string;
    'Collab Count'?: number;
    'Average Rate'?: number;
    [key: string]: unknown;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

/**
 * Airtable에서 모든 Influencer 레코드 가져오기
 */
export async function fetchAllInfluencers(): Promise<AirtableInfluencer[]> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const allRecords: AirtableInfluencer[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`);
    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    const data: AirtableResponse = await response.json();
    
    const mapped = data.records.map(record => mapAirtableRecord(record));
    allRecords.push(...mapped);

    offset = data.offset;
  } while (offset);

  return allRecords;
}

/**
 * 특정 계정들의 Influencer 데이터 가져오기 (청크 단위)
 */
export async function fetchInfluencersByAccounts(accounts: string[]): Promise<AirtableInfluencer[]> {
  if (accounts.length === 0) return [];

  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const CHUNK_SIZE = 40;
  const allRecords: AirtableInfluencer[] = [];

  for (let i = 0; i < accounts.length; i += CHUNK_SIZE) {
    const chunk = accounts.slice(i, i + CHUNK_SIZE);
    const filterFormula = buildFilterFormula(chunk);
    
    const url = new URL(`https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`);
    url.searchParams.set('filterByFormula', filterFormula);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Airtable chunk request failed: ${response.status}`);
      continue;
    }

    const data: AirtableResponse = await response.json();
    const mapped = data.records.map(record => mapAirtableRecord(record));
    allRecords.push(...mapped);

    // Rate limiting
    if (i + CHUNK_SIZE < accounts.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return allRecords;
}

/**
 * 단일 계정으로 Influencer 데이터 가져오기
 */
export async function fetchInfluencerByAccount(account: string): Promise<AirtableInfluencer | null> {
  const results = await fetchInfluencersByAccounts([account]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Airtable 필터 공식 생성
 */
function buildFilterFormula(accounts: string[]): string {
  const escaped = accounts.map(a => `{Influencer Account}='${escapeAirtableString(a)}'`);
  return `OR(${escaped.join(',')})`;
}

/**
 * Airtable 문자열 이스케이프
 */
function escapeAirtableString(s: string): string {
  return s.replace(/'/g, "\\'");
}

/**
 * Airtable 레코드를 앱 형식으로 변환
 */
function mapAirtableRecord(record: AirtableRecord): AirtableInfluencer {
  const fields = record.fields;
  
  return {
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
  };
}

/**
 * Rate History 문자열 생성 (Collab Count * Average Rate)
 */
export function formatRateHistory(collabCount?: number, averageRate?: number): string {
  if (collabCount === undefined || averageRate === undefined) return '';
  const roundedRate = Math.round(averageRate);
  return `${collabCount} * ${roundedRate}$`;
}

// ============================================
// WRITE OPERATIONS (Create, Update, Delete)
// ============================================

/**
 * 앱 형식을 Airtable 필드로 변환
 */
function mapToAirtableFields(data: Partial<AirtableInfluencerInput>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  
  if (data.account !== undefined) fields['Influencer Account'] = data.account;
  if (data.tiktokProfileLink !== undefined) fields['TIKTOK PROFILE LINK'] = data.tiktokProfileLink;
  if (data.email !== undefined) fields['Email'] = data.email;
  if (data.followers !== undefined) fields['Followers'] = data.followers;
  if (data.maxViews !== undefined) fields['MAX Views'] = data.maxViews;
  if (data.averageViews5 !== undefined) fields['5_average'] = data.averageViews5;
  if (data.medianViews20 !== undefined) fields['20_median'] = data.medianViews20;
  if (data.averageViews20 !== undefined) fields['20_average'] = data.averageViews20;
  if (data.followersDistribution !== undefined) fields['Followers 분포'] = data.followersDistribution;
  if (data.collabCount !== undefined) fields['Collab Count'] = data.collabCount;
  if (data.averageRate !== undefined) fields['Average Rate'] = data.averageRate;
  
  return fields;
}

/**
 * 새 Influencer 레코드 생성
 */
export async function createInfluencerInAirtable(data: AirtableInfluencerInput): Promise<AirtableInfluencer> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: mapToAirtableFields(data),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable create error: ${response.status} - ${errorText}`);
  }

  const record: AirtableRecord = await response.json();
  return mapAirtableRecord(record);
}

/**
 * Influencer 레코드 업데이트
 */
export async function updateInfluencerInAirtable(
  recordId: string, 
  data: Partial<AirtableInfluencerInput>
): Promise<AirtableInfluencer> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}/${recordId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: mapToAirtableFields(data),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable update error: ${response.status} - ${errorText}`);
  }

  const record: AirtableRecord = await response.json();
  return mapAirtableRecord(record);
}

/**
 * Influencer 레코드 삭제
 */
export async function deleteInfluencerFromAirtable(recordId: string): Promise<boolean> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}/${recordId}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${config.token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable delete error: ${response.status} - ${errorText}`);
  }

  return true;
}

/**
 * 여러 Influencer 레코드 일괄 생성 (최대 10개씩)
 */
export async function batchCreateInfluencersInAirtable(
  dataList: AirtableInfluencerInput[]
): Promise<AirtableInfluencer[]> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const BATCH_SIZE = 10; // Airtable 제한
  const results: AirtableInfluencer[] = [];

  for (let i = 0; i < dataList.length; i += BATCH_SIZE) {
    const batch = dataList.slice(i, i + BATCH_SIZE);
    
    const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch.map(data => ({ fields: mapToAirtableFields(data) })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable batch create error: ${response.status} - ${errorText}`);
    }

    const data: AirtableResponse = await response.json();
    const mapped = data.records.map(record => mapAirtableRecord(record));
    results.push(...mapped);

    // Rate limiting
    if (i + BATCH_SIZE < dataList.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * 여러 Influencer 레코드 일괄 업데이트 (최대 10개씩)
 */
export async function batchUpdateInfluencersInAirtable(
  updates: Array<{ id: string; data: Partial<AirtableInfluencerInput> }>
): Promise<AirtableInfluencer[]> {
  const config = getAirtableConfig();
  if (!config.token) {
    throw new Error('AIRTABLE_API_TOKEN not configured');
  }

  const BATCH_SIZE = 10;
  const results: AirtableInfluencer[] = [];

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    const url = `https://api.airtable.com/v0/${config.baseId}/${encodeURIComponent(config.tableName)}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch.map(({ id, data }) => ({ 
          id, 
          fields: mapToAirtableFields(data) 
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable batch update error: ${response.status} - ${errorText}`);
    }

    const data: AirtableResponse = await response.json();
    const mapped = data.records.map(record => mapAirtableRecord(record));
    results.push(...mapped);

    // Rate limiting
    if (i + BATCH_SIZE < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}
