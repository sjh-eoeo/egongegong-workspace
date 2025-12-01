'use client';

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import type { Project, Influencer, Brand, User } from '@/types';
import { InfluencerStatus } from '@/types';

// ============================================
// PROJECTS
// ============================================

export async function createProject(data: Omit<Project, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', id));
}

export async function getProject(id: string): Promise<Project | null> {
  const docSnap = await getDoc(doc(db, 'projects', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
}

// ============================================
// INFLUENCERS
// ============================================

export async function createInfluencer(data: Omit<Influencer, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'influencers'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateInfluencer(id: string, data: Partial<Influencer>): Promise<void> {
  const docRef = doc(db, 'influencers', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateInfluencerStatus(id: string, status: Influencer['status']): Promise<void> {
  await updateInfluencer(id, { status });
}

export async function deleteInfluencer(id: string): Promise<void> {
  await deleteDoc(doc(db, 'influencers', id));
}

export async function getInfluencer(id: string): Promise<Influencer | null> {
  const docSnap = await getDoc(doc(db, 'influencers', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Influencer;
  }
  return null;
}

export async function getInfluencersByProject(projectId: string): Promise<Influencer[]> {
  const q = query(collection(db, 'influencers'), where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
}

// Batch update multiple influencers
export async function batchUpdateInfluencers(
  updates: { id: string; data: Partial<Influencer> }[]
): Promise<void> {
  const batch = writeBatch(db);
  
  updates.forEach(({ id, data }) => {
    const docRef = doc(db, 'influencers', id);
    batch.update(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

// ============================================
// BRANDS
// ============================================

export async function createBrand(data: Omit<Brand, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'brands'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBrand(id: string, data: Partial<Brand>): Promise<void> {
  const docRef = doc(db, 'brands', id);
  await updateDoc(docRef, data);
}

export async function deleteBrand(id: string): Promise<void> {
  await deleteDoc(doc(db, 'brands', id));
}

// ============================================
// ZENDESK ACCOUNTS
// ============================================

export async function createZendeskAccount(data: {
  name: string;
  subdomain: string;
  email: string;
  apiToken: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'zendeskAccounts'), {
    ...data,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateZendeskAccount(id: string, data: Partial<{
  name: string;
  subdomain: string;
  email: string;
  apiToken: string;
  isActive: boolean;
}>): Promise<void> {
  const docRef = doc(db, 'zendeskAccounts', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteZendeskAccount(id: string): Promise<void> {
  await deleteDoc(doc(db, 'zendeskAccounts', id));
}

export async function getZendeskAccounts(): Promise<{ id: string; name: string; subdomain: string; email: string; apiToken: string; isActive: boolean }[]> {
  const snapshot = await getDocs(collection(db, 'zendeskAccounts'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; name: string; subdomain: string; email: string; apiToken: string; isActive: boolean }));
}

export async function getZendeskAccountById(id: string): Promise<{ id: string; name: string; subdomain: string; email: string; apiToken: string; isActive: boolean } | null> {
  const docSnap = await getDoc(doc(db, 'zendeskAccounts', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as { id: string; name: string; subdomain: string; email: string; apiToken: string; isActive: boolean };
  }
  return null;
}

// ============================================
// USERS
// ============================================

export async function createUser(data: Omit<User, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'users'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, data);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', id));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.docs.length > 0) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
  return null;
}

// ============================================
// CATEGORIES
// ============================================

export async function createCategory(data: { name: string }): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCategories(): Promise<{ id: string; name: string }[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; name: string }));
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ============================================
// WORKFLOW HELPERS
// ============================================

/**
 * Move influencer to next status in the workflow
 * Discovery → Contacted → Negotiating → Approved → Shipped → ContentLive → PaymentPending → Paid
 */
export async function advanceInfluencerStatus(id: string, currentStatus: InfluencerStatus): Promise<void> {
  const statusFlow: InfluencerStatus[] = [
    InfluencerStatus.Discovery,
    InfluencerStatus.Contacted, 
    InfluencerStatus.Negotiating,
    InfluencerStatus.Approved,
    InfluencerStatus.Shipped,
    InfluencerStatus.ContentLive,
    InfluencerStatus.PaymentPending,
    InfluencerStatus.Paid
  ];
  
  const currentIndex = statusFlow.indexOf(currentStatus);
  if (currentIndex < statusFlow.length - 1) {
    await updateInfluencerStatus(id, statusFlow[currentIndex + 1]);
  }
}

/**
 * Mark influencer as paid and update related project spent
 */
export async function processPayment(
  influencerId: string, 
  projectId: string,
  amount: number
): Promise<void> {
  const batch = writeBatch(db);
  
  // Update influencer status to Paid
  const influencerRef = doc(db, 'influencers', influencerId);
  batch.update(influencerRef, {
    status: InfluencerStatus.Paid,
    updatedAt: serverTimestamp(),
  });
  
  // Update project spent amount
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists()) {
    const currentSpent = projectSnap.data().spent || 0;
    batch.update(projectRef, {
      spent: currentSpent + amount,
      updatedAt: serverTimestamp(),
    });
  }
  
  await batch.commit();
}

/**
 * Add influencers to a project from creator pool
 */
export async function addInfluencersToProject(
  influencerIds: string[], 
  projectId: string
): Promise<void> {
  const batch = writeBatch(db);
  
  influencerIds.forEach(id => {
    const docRef = doc(db, 'influencers', id);
    batch.update(docRef, {
      projectId,
      status: InfluencerStatus.Discovery,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

/**
 * Update contract details for an influencer
 */
export async function updateContract(
  influencerId: string,
  contractData: Partial<Influencer['contract']>
): Promise<void> {
  const docRef = doc(db, 'influencers', influencerId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentContract = docSnap.data().contract || {};
    await updateDoc(docRef, {
      contract: { ...currentContract, ...contractData },
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Update logistics for an influencer
 */
export async function updateLogistics(
  influencerId: string,
  logisticsData: Partial<Influencer['logistics']>
): Promise<void> {
  const docRef = doc(db, 'influencers', influencerId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const currentLogistics = docSnap.data().logistics || {};
    await updateDoc(docRef, {
      logistics: { ...currentLogistics, ...logisticsData },
      updatedAt: serverTimestamp(),
    });
  }
}
