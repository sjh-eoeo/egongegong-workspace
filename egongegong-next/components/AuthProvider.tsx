'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useAuthStore, type AppUser } from '@/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAppUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Set loading true while processing
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check user status in Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setAppUser(userDocSnap.data() as AppUser);
          } else {
            // Create new user document with pending status
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'user',
              status: 'pending',
              displayName: firebaseUser.displayName || undefined,
            };
            
            await setDoc(userDocRef, newUser);
            setAppUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching/creating user document:', error);
          setAppUser(null);
        }
      } else {
        setUser(null);
        setAppUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAppUser, setLoading]);

  return <>{children}</>;
}
