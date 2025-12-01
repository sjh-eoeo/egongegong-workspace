'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui';
import { useUsers } from '@/hooks/useCollection';
import { User } from '@/types';

export const PendingApprovalPage: React.FC = () => {
  const router = useRouter();
  const { appUser, reset } = useAuthStore();
  const { data: usersData } = useUsers();
  const users = usersData as User[];
  const admins = users.filter(u => u.role === 'Admin');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      reset();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleDevApprove = () => {
    // Developer bypass for demo
    router.push('/projects');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-100">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Account Pending Approval</h1>
          <p className="text-sm text-gray-500 mt-2">
            Hi <span className="font-medium text-gray-900">{appUser?.name || appUser?.email}</span>, your account has been created but requires administrator approval before you can access the dashboard.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Please contact an Admin</h3>
          <div className="space-y-4">
            {admins.length === 0 ? (
              <p className="text-sm text-gray-500">No administrators found. Please contact support.</p>
            ) : admins.map(admin => (
              <div key={admin.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {admin.name?.charAt(0) || 'A'}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900">{admin.name}</div>
                  <div className="text-xs text-gray-500">{admin.email}</div>
                </div>
                <Button 
                  variant="secondary"
                  className="text-xs h-8 py-0 shadow-none"
                  onClick={() => alert(`Request sent to ${admin.email}`)}
                >
                  Request
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="ghost" onClick={handleLogout} icon={LogOut} className="w-full justify-center">
            Sign Out
          </Button>
          
          {/* Developer Backdoor for Demo Purposes */}
          <button 
            onClick={handleDevApprove} 
            className="text-[10px] text-gray-300 hover:text-gray-400 mt-4 underline decoration-dashed"
          >
            (Developer) Simulate Approval
          </button>
        </div>
      </div>
    </div>
  );
};
