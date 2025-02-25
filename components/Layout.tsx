import React from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import { Layers } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Domain Cluster Analysis',
  description = 'Dashboard for analyzing protein domain clusters and their evolutionary relationships'
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <Layers className="h-4 w-4 text-blue-500 mr-2" />
              <span>Domain Cluster Analysis • {new Date().getFullYear()}</span>
            </div>
            <div className="text-sm text-gray-500">
              Database last updated: February 20, 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;