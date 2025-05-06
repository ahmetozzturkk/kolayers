'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <header className="bg-lavender-900 text-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto py-5 px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity flex items-center">
          <div className="w-9 h-9 bg-lavender-300 rounded-lg flex items-center justify-center mr-3 shadow-lg">
            <span className="text-lavender-900 text-xl font-extrabold">k</span>
          </div>
          <span className="font-semibold tracking-wide">kolayers</span>
        </Link>
        {isHomePage && (
          <Link href="/login" className="px-6 py-2 bg-lavender-300 text-lavender-900 rounded-lg font-medium hover:bg-lavender-200 transition-colors shadow-sm">
            login
          </Link>
        )}
      </div>
    </header>
  );
} 