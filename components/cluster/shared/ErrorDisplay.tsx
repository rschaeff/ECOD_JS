// components/cluster/shared/ErrorDisplay.tsx
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  returnLink?: string;
  returnLinkText?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  returnLink, 
  returnLinkText = 'Return' 
}) => (
  <div className="text-center p-6 bg-white rounded-lg shadow-sm">
    <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-3" />
    <h2 className="text-xl font-bold text-red-600">Error</h2>
    <p className="mt-2 text-gray-700">{error}</p>
    <div className="mt-4 flex justify-center gap-3">
      {onRetry && (
        <Button onClick={onRetry}>
          Try Again
        </Button>
      )}
      {returnLink && (
        <Link href={returnLink} passHref>
          <Button variant="outline">
            {returnLinkText}
          </Button>
        </Link>
      )}
    </div>
  </div>
);

export default ErrorDisplay;