// /components/dashboard/RecentClustersPanel.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, Clock, Info } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRecentClusters, RecentCluster } from '@/hooks/useRecentClusters';

interface RecentClustersPanelProps {
  className?: string;
  limit?: number;
}

const RecentClustersPanel: React.FC<RecentClustersPanelProps> = ({ 
  className,
  limit = 5
}) => {
  const { data, loading, error, refresh, refreshing } = useRecentClusters(limit);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Format a timestamp to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Get filtered clusters based on status
  const filteredClusters = React.useMemo(() => {
    if (!data) return [];
    if (statusFilter === 'all') return data;
    return data.filter(cluster => cluster.status === statusFilter);
  }, [data, statusFilter]);

  // Get status badge with appropriate color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-500">New</Badge>;
      case 'updated':
        return <Badge className="bg-blue-500">Updated</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500">Flagged</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={className} data-testid="recent-clusters-panel">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recently Added Clusters</CardTitle>
            <CardDescription>
              New domain clusters from the latest analysis run
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={refreshing || loading}
            data-testid="refresh-recent-clusters-btn"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          // Loading skeleton
          <div className="space-y-4" data-testid="recent-clusters-loading">
            {Array(limit).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="p-4 bg-red-50 rounded-md text-red-700" data-testid="recent-clusters-error">
            <AlertTriangle className="h-5 w-5 mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? 'Trying again...' : 'Try Again'}
            </Button>
          </div>
        ) : filteredClusters.length === 0 ? (
          // Empty state
          <div className="text-center py-10" data-testid="recent-clusters-empty">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No recent clusters {statusFilter !== 'all' ? `with status '${statusFilter}'` : ''}</p>
          </div>
        ) : (
          // Clusters list
          <div className="space-y-4" data-testid="recent-clusters-list">
            {/* Optional filter tabs */}
            <Tabs 
              value={statusFilter} 
              onValueChange={setStatusFilter}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="updated">Updated</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredClusters.map((cluster) => (
              <div key={cluster.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`cluster-${cluster.id}`}>
                <div className="flex justify-between items-start">
                  <Link href={`/clusters/${cluster.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate">
                    {cluster.name}
                  </Link>
                  <div className="flex space-x-2 items-center">
                    {getStatusBadge(cluster.status)}
                    <Badge>{cluster.size} members</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 mt-2 text-sm">
                  <div className="truncate">
                    <span className="text-gray-500">Representative:</span>{' '}
                    <span title={cluster.representativeDomain} className="truncate">
                      {cluster.representativeDomain}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Taxonomic Diversity:</span>{' '}
                    {formatPercentage(cluster.taxonomicDiversity)}
                  </div>
                  {cluster.t_group && (
                    <div className="col-span-2 mt-1 truncate">
                      <span className="text-gray-500">T-Group:</span>{' '}
                      {cluster.t_group}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(cluster.modified_at || cluster.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/clusters" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <span>View all clusters</span>
          <Info className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentClustersPanel;

//2/26/2025 - RecentClusters swapped out for PriorityClusters