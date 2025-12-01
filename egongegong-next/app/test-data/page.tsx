'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function TestDataPage() {
  const [projects, setProjects] = useState<unknown[]>([]);
  const [influencers, setInfluencers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(projectsData);
        console.log('Projects:', projectsData);

        // Fetch influencers
        const influencersSnapshot = await getDocs(collection(db, 'influencers'));
        const influencersData = influencersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInfluencers(influencersData);
        console.log('Influencers:', influencersData);

        setLoading(false);
      } catch (err) {
        console.error('Firestore error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const createTestProject = async () => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        title: 'Test Campaign ' + Date.now(),
        brand: 'Test Brand',
        status: 'Active',
        budget: 10000,
        spent: 0,
        description: 'Test project',
        startDate: new Date().toISOString().split('T')[0],
        managers: ['test@example.com'],
        createdAt: serverTimestamp(),
      });
      console.log('Created project:', docRef.id);
      alert('Project created: ' + docRef.id);
      window.location.reload();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  const createTestInfluencer = async () => {
    try {
      const docRef = await addDoc(collection(db, 'influencers'), {
        handle: '@test_creator_' + Date.now(),
        name: 'Test Creator',
        email: 'test@example.com',
        country: 'KR',
        followerCount: 50000,
        status: 'Discovery',
        category: 'Beauty',
        agreedAmount: 500,
        currency: 'USD',
        paymentStatus: 'Unpaid',
        metrics: { 
          views: 10000, 
          likes: 500, 
          comments: 50, 
          shares: 10, 
          engagementRate: 5.6,
          avgViewsPerVideo: 8000
        },
        contract: { 
          totalAmount: 500, 
          currency: 'USD', 
          videoCount: 3, 
          paymentMethod: 'Wise',
          paymentSchedule: 'Upon Completion',
          milestones: [],
          status: 'Draft',
          platform: 'TikTok'
        },
        logistics: { status: 'Pending' },
        content: { 
          status: 'Waiting for Draft', 
          isApproved: false, 
          postedVideos: [] 
        },
        history: [],
        notes: 'Test influencer',
        createdAt: serverTimestamp(),
      });
      console.log('Created influencer:', docRef.id);
      alert('Influencer created: ' + docRef.id);
      window.location.reload();
    } catch (err) {
      console.error('Error creating influencer:', err);
      alert('Error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔄 Loading Firestore Data...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">❌ Error</h1>
        <pre className="bg-red-50 p-4 rounded">{error}</pre>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔥 Firestore Data Test</h1>
      
      <div className="mb-8 flex gap-4">
        <button 
          onClick={createTestProject}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add Test Project
        </button>
        <button 
          onClick={createTestInfluencer}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Test Influencer
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Projects */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            📁 Projects ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p: unknown) => {
                const project = p as { id: string; title: string; brand: string; status: string };
                return (
                  <div key={project.id} className="p-3 bg-gray-100 rounded">
                    <div className="font-semibold">{project.title}</div>
                    <div className="text-sm text-gray-600">{project.brand} • {project.status}</div>
                    <div className="text-xs text-gray-400">{project.id}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Influencers */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            👤 Influencers ({influencers.length})
          </h2>
          {influencers.length === 0 ? (
            <p className="text-gray-500">No influencers found</p>
          ) : (
            <div className="space-y-2">
              {influencers.map((i: unknown) => {
                const inf = i as { id: string; name: string; handle: string; status: string; followerCount: number };
                return (
                  <div key={inf.id} className="p-3 bg-gray-100 rounded">
                    <div className="font-semibold">{inf.name}</div>
                    <div className="text-sm text-gray-600">{inf.handle} • {inf.status}</div>
                    <div className="text-xs text-gray-400">Followers: {inf.followerCount?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{inf.id}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="font-bold mb-2">Raw Data (Console)</h3>
        <p className="text-sm text-gray-500">Check browser console for full data</p>
      </div>
    </div>
  );
}
