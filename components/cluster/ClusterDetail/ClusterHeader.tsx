// components/cluster/ClusterDetail/ClusterHeader.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClusterHeaderProps {
  clusterData: {
    cluster: {
      cluster_number: number;
    };
    clusterSet?: {
      name: string;
      sequence_identity: number;
    };
    analysis?: {
      requires_new_classification?: boolean;
    };
    size: number;
  };
  onExport?: () => void;
}

const ClusterHeader: React.FC<ClusterHeaderProps> = ({ clusterData, onExport }) => {
  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const clusterName = `Cluster-${clusterData.cluster.cluster_number}`;
  const clusterSetName = clusterData.clusterSet?.name || 'Unknown';
  const sequenceIdentity = clusterData.clusterSet?.sequence_identity || 0;

  return (
    <div className="mb-6">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          href="/dashboard/clusters"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>Back to Cluster List</span>
        </Link>
      </div>

      {/* Header with title and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {clusterName}
            {clusterData.analysis?.requires_new_classification && (
              <Badge className="ml-2 bg-yellow-500">New Classification Needed</Badge>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            Cluster #{clusterData.cluster.cluster_number} from {clusterSetName} (
            {formatPercentage(sequenceIdentity)} identity threshold)
          </p>
        </div>
        
        {onExport && (
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={onExport}
          >
            <Download size={16} />
            <span>Export Data</span>
          </Button>
        )}
      </div>
      
      <div className="mt-2">
        <Badge className="bg-blue-500">{clusterData.size} Members</Badge>
      </div>
    </div>
  );
};

export default ClusterHeader;