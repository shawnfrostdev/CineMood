'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Film, List, User } from 'lucide-react';
import AuthButton from '@/components/auth/AuthButton';

const navItems = [
  { name: 'Recommend', href: '/recommend', icon: Heart },
  { name: 'Selection', href: '/selection', icon: Film },
  { name: 'My List', href: '/my-list', icon: List },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 bg-[#0C100E] text-[#F0EDD1] p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F0EDD1]">CineMood</h1>
        <p className="text-sm text-[#436029]">Movie & TV Recommender</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-[#0F1D18] text-[#F0EDD1]' 
                      : 'text-[#436029] hover:bg-[#0F1D18] hover:text-[#F0EDD1]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-[#436029]/20">
        <AuthButton />
      </div>
    </div>
  );
} 