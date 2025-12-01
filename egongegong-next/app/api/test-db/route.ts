import { NextResponse } from 'next/server';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET() {
  try {
    // Fetch projects
    const projectsSnapshot = await getDocs(collection(db, 'projects'));
    const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch influencers
    const influencersSnapshot = await getDocs(collection(db, 'influencers'));
    const influencers = influencersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch brands
    const brandsSnapshot = await getDocs(collection(db, 'brands'));
    const brands = brandsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      status: 'ok',
      counts: {
        projects: projects.length,
        influencers: influencers.length,
        brands: brands.length,
        users: users.length,
      },
      data: {
        projects,
        influencers,
        brands,
        users,
      }
    });
  } catch (error) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collection: collectionName, data } = body;

    if (!collectionName || !data) {
      return NextResponse.json({ error: 'Missing collection or data' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ 
      status: 'ok', 
      id: docRef.id,
      message: `Created document in ${collectionName}` 
    });
  } catch (error) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
