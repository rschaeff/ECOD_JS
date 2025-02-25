// components/layout/DashboardLayout.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Search, Settings, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  initialSearchQuery?: string;
}

export default function DashboardLayout({
  children,
  title,
  description,
  onSearch,
  searchPlaceholder = "Search domains, clusters, or T-groups...",
  initialSearchQuery = "",
}: DashboardLayoutProps) {
  const [searchQuery, setSearchQuery] = React.useState(initialSearchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {onSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              )}
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings size={16} />
                <span>Settings</span>
              </Button>
            </div>
          </div>
          
          {description && (
            <div className="pb-4">
              <p className="text-gray-500">{description}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Domain Classification Dashboard • {new Date().getFullYear()}
            </div>
            <div className="text-sm text-gray-500">
              Database last updated: February 20, 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}