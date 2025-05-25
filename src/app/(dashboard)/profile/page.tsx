'use client';

import { useSession, signIn } from 'next-auth/react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#F0EDD1]">Profile</h1>
      </div>

      <div className="bg-[#0C100E] rounded-lg p-8 text-[#F0EDD1]">
        {isLoading ? (
          <div className="flex justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-[#436029] border-t-transparent animate-spin" />
          </div>
        ) : user ? (
          <div className="flex flex-col items-center">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name || 'Profile'} 
                className="w-24 h-24 rounded-full mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#436029] mb-4 flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            <h2 className="text-xl font-medium">{user.name || 'User'}</h2>
            <p className="text-[#436029] mt-1">{user.email}</p>
            
            <div className="mt-8 text-center">
              <h3 className="text-lg mb-2">Theme Settings</h3>
              <p className="text-[#436029] mb-4">Dark/Light mode toggle coming soon</p>
              
              <h3 className="text-lg mb-2 mt-6">List Sharing</h3>
              <p className="text-[#436029]">Share your list with friends (Coming soon)</p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[#436029] mb-4">
              Please sign in to view your profile.
            </p>
            <button 
              onClick={() => signIn('github')}
              className="px-4 py-2 bg-[#436029] text-[#F0EDD1] rounded-md hover:bg-[#516F39] transition-colors"
            >
              Sign In with GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 