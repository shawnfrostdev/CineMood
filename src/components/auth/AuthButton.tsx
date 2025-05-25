'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
        disabled
      >
        <span className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-transparent animate-spin" />
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-4 py-2 bg-[#0F1D18] text-[#F0EDD1] rounded-md hover:bg-[#0C100E] transition-colors"
      >
        <LogOut size={18} />
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 px-4 py-2 bg-[#436029] text-[#F0EDD1] rounded-md hover:bg-[#516F39] transition-colors"
    >
      <LogIn size={18} />
      Sign in
    </button>
  );
} 