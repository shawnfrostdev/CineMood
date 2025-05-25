'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { GitHub } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      await signIn('github', { callbackUrl: '/recommend' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C100E] p-4">
      <div className="w-full max-w-md bg-[#0F1D18] rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#F0EDD1]">CineMood</h1>
          <p className="text-[#436029] mt-2">Sign in to your account</p>
        </div>

        <button
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#436029] text-[#F0EDD1] rounded-md hover:bg-[#516F39] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="w-5 h-5 rounded-full border-2 border-[#F0EDD1] border-t-transparent animate-spin" />
          ) : (
            <>
              <GitHub size={20} />
              <span>Continue with GitHub</span>
            </>
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-[#436029]">
            <Link href="/" className="text-[#F0EDD1] hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 