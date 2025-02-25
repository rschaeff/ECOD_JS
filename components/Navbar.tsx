import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Database, 
  Layers, 
  FileSearch, 
  BarChart2, 
  Menu, 
  X, 
  Settings,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default behavior - redirect to search page
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <BarChart2 className="h-4 w-4 mr-1" /> },
    { path: '/clusters', label: 'Clusters', icon: <Layers className="h-4 w-4 mr-1" /> },
  //  { path: '/search', label: 'Search', icon: <FileSearch className="h-4 w-4 mr-1" /> },
 //   { path: '/database', label: 'Database', icon: <Database className="h-4 w-4 mr-1" /> },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Layers className="h-7 w-7 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Domain Cluster Analysis</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center">
                  {item.icon}
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          
          {/* Search and settings (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search domains, clusters..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings size={16} />
              <span>Settings</span>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center">
                  {React.cloneElement(item.icon, { className: 'h-5 w-5 mr-2' })}
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
          
          {/* Mobile search */}
          <div className="pt-2 pb-3 px-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search domains, clusters..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
            <Button variant="outline" size="sm" className="flex items-center gap-1 mt-2 w-full justify-center">
              <Settings size={16} />
              <span>Settings</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;