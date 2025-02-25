// components/layout/PageHeader.tsx
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { Search, Settings, ArrowLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export interface PageHeaderAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  backLink?: {
    href: string;
    label: string;
  };
  actions?: PageHeaderAction[];
  searchProps?: {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
  };
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export default function PageHeader({
  title,
  description,
  icon,
  backLink,
  actions = [],
  searchProps,
  breadcrumbs,
}: PageHeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState(searchProps?.value || '');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchProps?.onChange) {
      searchProps.onChange(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchProps?.onSearch) {
      searchProps.onSearch(searchQuery);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="py-2">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {breadcrumb.href ? (
                    <Link href={breadcrumb.href} className="hover:text-blue-600">
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{breadcrumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back link */}
        {backLink && (
          <div className="py-2">
            <Link 
              href={backLink.href} 
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={14} className="mr-1" />
              <span>{backLink.label}</span>
            </Link>
          </div>
        )}

        <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Title and description */}
          <div className="flex items-start">
            {icon && <div className="mr-3 text-blue-600">{icon}</div>}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="mt-4 sm:hidden">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="ml-2">{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </Button>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            {searchProps && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchProps.placeholder || "Search..."}
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
            )}

            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className="flex items-center gap-1"
              >
                {action.icon}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile actions (shown when menu is open) */}
        {mobileMenuOpen && (
          <div className="pb-4 sm:hidden space-y-3">
            {searchProps && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchProps.placeholder || "Search..."}
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
            )}

            <div className="space-y-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="w-full justify-start"
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}