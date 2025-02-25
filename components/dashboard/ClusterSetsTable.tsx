// /components/dashboard/ClusterSetsTable.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, AlertTriangle, Search, Filter, Download } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useClusterSets } from '@/hooks/useClusterSets';

interface ClusterSetsTableProps {
  selectedClusterSet: string;
  onClusterSetChange: (value: string) => void;
  className?: string;
}

const ClusterSetsTable: React.FC<ClusterSetsTableProps> = ({
  selectedClusterSet,
  onClusterSetChange,
  className
}) => {
  const { data, loading, error, refresh, isRefreshing, filterByIdentity } = useClusterSets();
  const [searchQuery, setSearchQuery] = useState('');
  const [identityFilter, setIdentityFilter] = useState('all');

  // Handle export to CSV
  const handleExportCSV = () => {
    if (!data) return;

    // Create CSV content
    const headers = ['ID', 'Name', 'Clusters', 'Domains', 'Taxonomic Coverage'];
    const rows = data.map(set => [
      set.id,
      set.name,
      set.clusters,
      set.domains,
      (set.taxonomicCoverage * 100).toFixed(1) + '%'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cluster_sets.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Filter data based on search query and identity filter
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    
    // First filter by identity threshold
    const identityFiltered = filterByIdentity(identityFilter);
    
    // Then filter by search query
    if (!searchQuery.trim()) return identityFiltered;
    
    const query = searchQuery.toLowerCase();
    return identityFiltered.filter(set => 
      set.name.toLowerCase().includes(query)
    );
  }, [data, searchQuery, identityFilter, filterByIdentity]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Cluster Sets</CardTitle>
            <CardDescription>
              Overview of domain cluster sets at different sequence identity thresholds
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleExportCSV}
              disabled={!data || loading || isRefreshing}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              type="text" 
              placeholder="Search cluster sets..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-64">
            <Select value={identityFilter} onValueChange={setIdentityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by identity" />
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

        {/* Table Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
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
        ) : filteredData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No cluster sets found matching your search criteria.</p>
          </div>
        ) : (
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
                {filteredData.map((set, index) => (
                  <tr key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 px-4 font-medium">{set.name}</td>
                    <td className="py-2 px-4 text-right">{set.clusters.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{set.domains.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">
                      <Badge className={
                        set.taxonomicCoverage >= 0.9 ? 'bg-green-500' :
                        set.taxonomicCoverage >= 0.7 ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }>
                        {formatPercentage(set.taxonomicCoverage)}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Link 
                        href={`/cluster-sets/${set.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => onClusterSetChange(set.id.toString())}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary information */}
        {!loading && !error && filteredData.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredData.length} of {data?.length || 0} cluster sets
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClusterSetsTable;