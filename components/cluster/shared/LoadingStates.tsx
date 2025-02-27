// components/cluster/shared/LoadingStates.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Simple spinner with optional text
export const Spinner: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  text, 
  size = 'md' 
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center">
      <RefreshCw className={`${sizeMap[size]} animate-spin text-blue-500`} />
      {text && <p className="text-gray-600 mt-2">{text}</p>}
    </div>
  );
};

// Card with spinner for loading state
export const LoadingCard: React.FC<{
  title?: string;
  description?: string;
  height?: string;
}> = ({ 
  title = 'Loading', 
  description = 'Please wait while data is being loaded...',
  height = 'h-64'
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`flex items-center justify-center ${height}`}>
        <Spinner text="Loading data..." size="lg" />
      </CardContent>
    </Card>
  );
};

// Table rows loading skeleton
export const TableRowsLoading: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="p-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Table header loading skeleton
export const TableHeaderLoading: React.FC<{
  columns?: number;
}> = ({ 
  columns = 5 
}) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <th key={colIndex} className="p-4">
          <Skeleton className="h-4 w-full" />
        </th>
      ))}
    </tr>
  );
};

// List items loading skeleton
export const ListItemsLoading: React.FC<{
  items?: number;
  height?: string;
}> = ({ 
  items = 5,
  height = 'h-12'
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className={`${height} w-full rounded-md`}>
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
};

// Chart loading skeleton
export const ChartLoading: React.FC<{
  height?: string;
}> = ({ 
  height = 'h-80' 
}) => {
  return (
    <div className={`${height} w-full rounded-md bg-gray-100 flex items-center justify-center`}>
      <Spinner text="Loading chart data..." />
    </div>
  );
};

// Grid cards loading
export const GridCardsLoading: React.FC<{
  cards?: number;
  columns?: number;
}> = ({ 
  cards = 6,
  columns = 3 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="h-40 rounded-md">
          <Skeleton className="h-full w-full" />
        </div>
      ))}
    </div>
  );
};

// Form fields loading
export const FormFieldsLoading: React.FC<{
  fields?: number;
}> = ({ 
  fields = 4 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};

// Page header loading
export const PageHeaderLoading: React.FC = () => {
  return (
    <div className="mb-6">
      <Skeleton className="h-6 w-40 mb-4" /> {/* Back link */}
      <Skeleton className="h-10 w-80 mb-2" /> {/* Title */}
      <Skeleton className="h-5 w-96 mb-2" /> {/* Subtitle */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24" /> {/* Badge or button */}
        <Skeleton className="h-6 w-32" /> {/* Badge or button */}
      </div>
    </div>
  );
};

// MolStar Viewer loading
export const MolstarViewerLoading: React.FC<{
  height?: string;
}> = ({ 
  height = 'h-96' 
}) => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" /> {/* Dropdown */}
              <Skeleton className="h-10 w-32" /> {/* Dropdown */}
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-md" /> {/* Button */}
              <Skeleton className="h-10 w-10 rounded-md" /> {/* Button */}
            </div>
          </div>
          
          <div className={`${height} w-full rounded-md bg-gray-100 border flex items-center justify-center`}>
            <div className="text-center">
              <RefreshCw className="h-16 w-16 animate-spin text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Loading structure viewer...</p>
              <p className="text-xs text-gray-400 mt-2">This may take a moment.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Combined default export
const LoadingStates = {
  Spinner,
  LoadingCard,
  TableRowsLoading,
  TableHeaderLoading,
  ListItemsLoading,
  ChartLoading,
  GridCardsLoading,
  FormFieldsLoading,
  PageHeaderLoading,
  MolstarViewerLoading
};

export default LoadingStates;