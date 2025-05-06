'use client';

import React from 'react';

export default function ClientFooter() {
  return (
    <footer className="bg-lavender-900 text-white py-5">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 bg-lavender-300 rounded-lg flex items-center justify-center mr-2 shadow-lg">
            <span className="text-lavender-900 text-base font-extrabold">k</span>
          </div>
          <span className="text-base font-semibold mr-3">kolayers</span>
          <span className="text-lavender-300 text-sm">© {new Date().getFullYear()} kolayers - the winners platform</span>
        </div>
      </div>
    </footer>
  );
} 