'use client';

import { useState, useCallback } from 'react';
import { collection, doc, setDoc, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface SyncedInfluencer {
  airtableId: string;
  handle: string;
  name: string;
  email: string;
  tiktokProfileLink: string;
  followerCount: number;
  country: string;
  followersDistribution: string;
  metrics: {
    views: number;
    maxViews: number;
    avgViewsPerVideo: number;
    medianViews: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
  collabCount: number;
  averageRate: number;
  status: string;
  category: string;
  agreedAmount: number;
  currency: string;
  paymentStatus: string;
}

interface SyncResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
}

export function useAirtableSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const syncFromAirtable = useCallback(async (limit: number = 50): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    setProgress('Fetching from Airtable...');

    try {
      // 1. API에서 Airtable 데이터 가져오기
      const response = await fetch(`/api/sync/airtable?limit=${limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch from Airtable');
      }

      const { data: airtableData } = await response.json() as { data: SyncedInfluencer[] };
      
      if (!airtableData || airtableData.length === 0) {
        setProgress('No data to sync');
        const result = { total: 0, created: 0, updated: 0, skipped: 0 };
        setLastResult(result);
        return result;
      }

      setProgress(`Processing ${airtableData.length} records...`);

      // 2. Firestore에 저장
      const influencersRef = collection(db, 'influencers');
      const BATCH_SIZE = 500; // Firestore batch limit
      
      let created = 0;
      let updated = 0;
      let skipped = 0;

      // 기존 airtableId 매핑 가져오기
      const existingMap = new Map<string, string>(); // airtableId -> firestoreId
      const existingQuery = query(influencersRef, where('airtableId', '!=', null));
      const existingSnapshot = await getDocs(existingQuery);
      existingSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.airtableId) {
          existingMap.set(data.airtableId, doc.id);
        }
      });

      // 배치로 처리
      for (let i = 0; i < airtableData.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = airtableData.slice(i, i + BATCH_SIZE);

        for (const record of chunk) {
          if (!record.airtableId || !record.handle) {
            skipped++;
            continue;
          }

          const existingId = existingMap.get(record.airtableId);
          
          const firestoreData = {
            ...record,
            updatedAt: serverTimestamp(),
            syncedFromAirtable: serverTimestamp(),
          };

          if (existingId) {
            // 업데이트 (status, category 등 기존 값 유지하고 메트릭만 업데이트)
            const docRef = doc(influencersRef, existingId);
            batch.update(docRef, {
              followerCount: record.followerCount,
              followersDistribution: record.followersDistribution,
              metrics: record.metrics,
              collabCount: record.collabCount,
              averageRate: record.averageRate,
              email: record.email,
              tiktokProfileLink: record.tiktokProfileLink,
              updatedAt: serverTimestamp(),
              syncedFromAirtable: serverTimestamp(),
            });
            updated++;
          } else {
            // 새로 생성
            const newDocRef = doc(influencersRef);
            batch.set(newDocRef, {
              ...firestoreData,
              createdAt: serverTimestamp(),
            });
            created++;
          }
        }

        await batch.commit();
        setProgress(`Processed ${Math.min(i + BATCH_SIZE, airtableData.length)}/${airtableData.length}`);
      }

      const result = { total: airtableData.length, created, updated, skipped };
      setLastResult(result);
      setProgress(`Sync complete: ${created} created, ${updated} updated`);
      
      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    syncFromAirtable,
    isSyncing,
    progress,
    error,
    lastResult,
  };
}
