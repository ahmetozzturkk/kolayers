import React from 'react';
import './globals.css';
import ClientNoFooter from '../components/ClientNoFooter';
import TaskContentInitializer from '../components/TaskContentInitializer';

export const metadata = {
  title: 'Kolayers - The Winners Platform',
  description: 'A better way to explore, learn, and engage with your work — designed for winners like you.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <TaskContentInitializer />
        <main className="flex-grow">
          {children}
        </main>
        <ClientNoFooter />
      </body>
    </html>
  );
}
