"use client";

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8 mt-12">
      <div className="container mx-auto px-4 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Kolayers - Gamification Platform</p>
      </div>
    </footer>
  );
} 