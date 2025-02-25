// components/ClusterBreadcrumbs.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const ClusterBreadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex mb-4 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={16} className="mx-2 text-gray-400" />}
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-blue-600 hover:text-blue-800"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default ClusterBreadcrumbs;