"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <header className="bg-indigo-600 text-white">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">Kolayers</Link>
        {!isLandingPage && (
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/badges" className="hover:text-indigo-200 transition-colors">
                  Badges
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-indigo-200 transition-colors">
                  Tasks
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="hover:text-indigo-200 transition-colors">
                  Certificates
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-indigo-200 transition-colors">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-200 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-200 transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
} 