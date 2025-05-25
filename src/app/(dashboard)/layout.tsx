'use client';

import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-4 overflow-hidden bg-[#0F1D18]">
        <div className="h-full w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 