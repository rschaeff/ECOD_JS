// components/BackButton.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  label: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href, label }) => {
  return (
    <Link 
      href={href}
      className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
    >
      <ChevronLeft size={16} className="mr-1" />
      <span>{label}</span>
    </Link>
  );
};

export default BackButton;