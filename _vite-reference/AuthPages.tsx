
import React, { useState } from 'react';
import { Button } from './UI';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: Partial<User>) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const handleGoogleClick = () => {
    // Simulate Google OAuth Response
    // In a real app, this would be the response from Firebase/Supabase/NextAuth
    const mockGoogleUser = {
      name: "New Team Member",
      email: "new.member@agency.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NewUser123"
    };
    onLogin(mockGoogleUser);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
       <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg">
             T
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">TikTok Seeding OS</h1>
          <p className="text-gray-500 mb-8 text-sm">Sign in to access your agency workspace</p>

          <button 
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
             </svg>
             <span className="group-hover:text-gray-900">Sign in with Google</span>
          </button>
       </div>
       <p className="mt-8 text-xs text-gray-400">Restricted Access. Agency Internal Use Only.</p>
    </div>
  );
};

interface PendingApprovalPageProps {
  user: User;
  onLogout: () => void;
  // Prop for developer testing to bypass pending state
  onDevApprove?: () => void;
}

export const PendingApprovalPage = ({ user, onLogout, onDevApprove }: PendingApprovalPageProps) => {
  const admins = MOCK_USERS.filter(u => u.role === 'Admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
       <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
           <div className="flex flex-col items-center text-center mb-8">
               <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-100">
                   <ShieldAlert size={32} />
               </div>
               <h1 className="text-xl font-bold text-gray-900">Account Pending Approval</h1>
               <p className="text-sm text-gray-500 mt-2">
                   Hi <span className="font-medium text-gray-900">{user.name}</span>, your account has been created but requires administrator approval before you can access the dashboard.
               </p>
           </div>

           <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Please contact an Admin</h3>
               <div className="space-y-4">
                   {admins.map(admin => (
                       <div key={admin.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                           <img 
                             src={admin.avatar} 
                             alt={admin.name} 
                             className="w-10 h-10 rounded-full bg-gray-200"
                           />
                           <div className="flex-1">
                               <div className="text-sm font-bold text-gray-900">{admin.name}</div>
                               <div className="text-xs text-gray-500">{admin.email}</div>
                           </div>
                           <Button 
                             className="text-xs h-8 py-0 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-none"
                             onClick={() => alert(`Request sent to ${admin.email}`)}
                           >
                               Request
                           </Button>
                       </div>
                   ))}
               </div>
           </div>

           <div className="flex flex-col gap-3">
               <Button variant="ghost" onClick={onLogout} icon={LogOut} className="w-full justify-center">
                   Sign Out
               </Button>
               
               {/* Developer Backdoor for Demo Purposes */}
               {onDevApprove && (
                   <button 
                     onClick={onDevApprove} 
                     className="text-[10px] text-gray-300 hover:text-indigo-400 mt-4 underline decoration-dashed"
                   >
                       (Developer) Simulate Approval
                   </button>
               )}
           </div>
       </div>
    </div>
  );
};
