// /components/dashboard/PriorityClusterPanel.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, Search, Info } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePriorityClusters } from '@/hooks/usePriorityClusters';

interface PriorityClusterPanelProps {
  className?: string;
  limit?: number;
}

const PriorityClusterPanel: React.FC<PriorityClusterPanelProps> = ({ 
  className,
  limit = 5
}) => {
  const { data, loading, error, refresh, refreshing } = usePriorityClusters(limit);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Get filtered clusters based on category
  const filteredClusters = React.useMemo(() => {
    if (!data) return [];
    if (categoryFilter === 'all') return data;
    return data.filter(cluster => cluster.category === categoryFilter);
  }, [data, categoryFilter]);

  // Get category badge with appropriate color
  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'unclassified':
        return <Badge className="bg-purple-500">Unclassified</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500">Flagged</Badge>;
      case 'reclassification':
        return <Badge className="bg-red-500">Needs Reclassification</Badge>;
      case 'diverse':
        return <Badge className="bg-green-500">Diverse</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={className} data-testid="priority-clusters-panel">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Priority Clusters</CardTitle>
            <CardDescription>
              Clusters requiring attention or with notable characteristics
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={refreshing || loading}
            data-testid="refresh-priority-clusters-btn"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          // Loading skeleton
          <div className="space-y-4" data-testid="priority-clusters-loading">
            {Array(limit).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="p-4 bg-red-50 rounded-md text-red-700" data-testid="priority-clusters-error">
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
        ) : (
          // Clusters list with category filter tabs
          <div className="space-y-4" data-testid="priority-clusters-list">
            <Tabs 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unclassified">Unclassified</TabsTrigger>
                <TabsTrigger value="flagged">Flagged</TabsTrigger>
                <TabsTrigger value="reclassification">Reclassify</TabsTrigger>
                <TabsTrigger value="diverse">Diverse</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredClusters.length === 0 ? (
              // Empty state
              <div className="text-center py-10" data-testid="priority-clusters-empty">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No clusters found in this category</p>
              </div>
            ) : (
              filteredClusters.map((cluster) => (
                <div key={cluster.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors" data-testid={`cluster-${cluster.id}`}>
                  <div className="flex justify-between items-start">
                    <Link href={`/clusters/${cluster.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate">
                      {cluster.name}
                    </Link>
                    <div className="flex space-x-2 items-center">
                      {getCategoryBadge(cluster.category)}
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
                    {cluster.structuralDiversity && (
                      <div className="mt-1">
                        <span className="text-gray-500">Structural Diversity:</span>{' '}
                        {formatPercentage(cluster.structuralDiversity)}
                      </div>
                    )}
                    {cluster.t_group && (
                      <div className="mt-1 truncate">
                        <span className="text-gray-500">T-Group:</span>{' '}
                        {cluster.t_group}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/clusters/priority" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <span>View all priority clusters</span>
          <Info className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PriorityClusterPanel;