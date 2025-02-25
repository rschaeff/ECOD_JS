// components/layout/PageFooter.tsx
import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface PageFooterProps {
  appName?: string;
  lastUpdated?: string | Date;
  showCopyright?: boolean;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  version?: string;
  simple?: boolean;
  customText?: React.ReactNode;
}

export default function PageFooter({
  appName = "Domain Classification Dashboard",
  lastUpdated,
  showCopyright = true,
  columns = [],
  socialLinks = [],
  version,
  simple = false,
  customText,
}: PageFooterProps) {
  const formattedDate = lastUpdated 
    ? new Date(lastUpdated).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;
  
  const currentYear = new Date().getFullYear();
  
  // Simple footer for minimalist pages
  if (simple) {
    return (
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-gray-500">
              {appName} • {currentYear}
              {version && <span className="ml-2 text-gray-400">v{version}</span>}
            </div>
            
            {formattedDate && (
              <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                Database last updated: {formattedDate}
              </div>
            )}
          </div>
          
          {customText && (
            <div className="mt-2 text-xs text-gray-500">
              {customText}
            </div>
          )}
        </div>
      </footer>
    );
  }
  
  // Full featured footer
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Main footer content */}
      {columns.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* App info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                {appName}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                A comprehensive platform for protein domain classification and analysis.
              </p>
              
              {socialLinks.length > 0 && (
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer columns */}
            {columns.map((column, colIndex) => (
              <div key={colIndex}>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.external ? (
                        <a 
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-600 hover:text-blue-600"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link 
                          href={link.href} 
                          className="text-sm text-gray-600 hover:text-blue-600"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Copyright and bottom section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              {showCopyright && (
                <span>&copy; {currentYear} {appName}. All rights reserved.</span>
              )}
              {version && (
                <span className="ml-2 text-gray-400">v{version}</span>
              )}
            </div>
            
            <div className="mt-3 sm:mt-0 text-sm text-gray-500 flex items-center">
              {formattedDate && (
                <span className="mr-4">Database last updated: {formattedDate}</span>
              )}
              
              {customText && (
                <span className="flex items-center">
                  <Heart size={14} className="mr-1 text-red-500" /> 
                  {customText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}