'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ClientFooter from './ClientFooter';

export default function ClientNoFooter() {
  const pathname = usePathname();
  
  // List of pages where footer should be hidden
  const noFooterPages = [
    '/dashboard',
    '/badges',
    '/tasks',
    '/certificates',
    '/rewards',
    '/profile'
  ];
  
  // Check if current path is in the list of pages where footer should be hidden
  const showFooter = !noFooterPages.includes(pathname);
  
  return showFooter ? <ClientFooter /> : null;
} 