'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Hook to subscribe to a Firestore collection with real-time updates
 */
export function useCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize constraints key for dependency
  const constraintsKey = useMemo(() => 
    JSON.stringify(constraints.map(c => String(c))), 
    [constraints]
  );

  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : query(collectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintsKey]);

  return { data, loading, error };
}

/**
 * Hook to get projects from Firestore
 */
export function useProjects() {
  return useCollection('projects');
}

/**
 * Hook to get influencers from Firestore, optionally filtered by projectId
 */
export function useInfluencers(projectId?: string) {
  const constraints: QueryConstraint[] = [];
  if (projectId) {
    constraints.push(where('projectId', '==', projectId));
  }
  return useCollection('influencers', constraints);
}

/**
 * Hook to get brands
 */
export function useBrands() {
  return useCollection('brands');
}

/**
 * Hook to get categories
 */
export function useCategories() {
  return useCollection('categories');
}

/**
 * Hook to get users
 */
export function useUsers() {
  return useCollection('users');
}

/**
 * Hook to get Zendesk accounts
 */
export function useZendeskAccounts() {
  return useCollection('zendeskAccounts');
}

export { where, orderBy };
