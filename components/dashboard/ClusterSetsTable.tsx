// /components/dashboard/ClusterSetsTable.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useClusterSets } from '@/hooks/useClusterSets';

interface ClusterSetsTableProps {
  selectedClusterSet?: string;
  onClusterSetChange?: (value: string) => void;
}

const ClusterSetsTable: React.FC<ClusterSetsTableProps> = ({ 
  selectedClusterSet = 'all', 
  onClusterSetChange 
}) => {
  const { data, loading, error, refresh, isRefreshing, filterByIdentity } = useClusterSets();
  const [searchQuery, setSearchQuery] = useState('');
  const [identityFilter, setIdentityFilter] = useState('all');

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Filter cluster sets based on search query
  const filteredClusterSets = React.useMemo(() => {
    if (!data) return [];
    
    // First apply identity filter
    let filtered = filterByIdentity(identityFilter);
    
    // Then apply search filter if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(set => 
        set.name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [data, searchQuery, identityFilter, filterByIdentity]);

  // Handle identity filter change
  const handleIdentityFilterChange = (value: string) => {
    setIdentityFilter(value);
  };

  // Handle selected cluster set change
  const handleClusterSetChange = (id: string) => {
    if (onClusterSetChange) {
      onClusterSetChange(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cluster Sets</CardTitle>
            <CardDescription>
              Overview of domain cluster sets at different sequence identity thresholds
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={refresh}
            disabled={isRefreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="mb-4 flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search cluster sets..." 
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="min-w-[180px]">
            <Select value={identityFilter} onValueChange={handleIdentityFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Identity Threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Thresholds</SelectItem>
                <SelectItem value="high">High (≥ 90%)</SelectItem>
                <SelectItem value="medium">Medium (70-90%)</SelectItem>
                <SelectItem value="low">Low (< 70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && !data && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 rounded-md text-red-700">
            <AlertTriangle className="h-5 w-5 mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={refresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Trying again...' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredClusterSets.length === 0 && !loading && !error && (
          <div className="text-center p-6 text-gray-500">
            <p>No cluster sets found matching your criteria.</p>
          </div>
        )}

        {/* Data Table */}
        {filteredClusterSets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-right">Clusters</th>
                  <th className="py-2 px-4 text-right">Domains</th>
                  <th className="py-2 px-4 text-right">Taxonomic Coverage</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClusterSets.map((set, index) => (
                  <tr key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 font-medium">{set.name}</td>
                    <td className="py-2 px-4 text-right">{set.clusters.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{set.domains.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{formatPercentage(set.taxonomicCoverage)}</td>
                    <td className="py-2 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link 
                          href={`/cluster-sets/${set.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </Link>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          onClick={() => handleClusterSetChange(set.id.toString())}
                        >
                          Select
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Result Summary */}
        {filteredClusterSets.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredClusterSets.length} {filteredClusterSets.length === 1 ? 'cluster set' : 'cluster sets'}
            {searchQuery && ` matching "${searchQuery}"`}
            {identityFilter !== 'all' && ` with ${identityFilter} identity threshold`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClusterSetsTable;