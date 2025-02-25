// components/ActionButton.tsx
import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
  href, 
  onClick, 
  icon: Icon, 
  label,
  variant = 'primary' 
}) => {
  const className = `inline-flex items-center gap-2 px-4 py-2 rounded ${
    variant === 'primary' 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : variant === 'secondary'
      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {Icon && <Icon size={16} />}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {Icon && <Icon size={16} />}
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;