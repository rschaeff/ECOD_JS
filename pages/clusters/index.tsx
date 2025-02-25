// pages/clusters/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Layout from '@/components/Layout';
import ClusterBreadcrumbs from '@/components/ClusterBreadcrumbs';
import apiService from '@/services/api';

const ClustersIndexPage = () => {
  const router = useRouter();
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterSetFilter, setClusterSetFilter] = useState('all');
  const [clusterSets, setClusterSets] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch available cluster sets for filtering
        const setsData = await apiService.getClusterSets();
        setClusterSets(setsData);
        
        // Fetch clusters with optional filtering
        const params: any = { 
          page: currentPage, 
          limit: itemsPerPage 
        };
        
        if (clusterSetFilter !== 'all') {
          params.clusterset_id = clusterSetFilter;
        }
        
        const clustersData = await apiService.getClusters(params);
        setClusters(clustersData.clusters);
        setTotalPages(Math.ceil(clustersData.total / itemsPerPage));
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load clusters. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, clusterSetFilter, itemsPerPage]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
    // Add search functionality here
    // This would typically filter the data or make a new API request with search params
  };

  // Format percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Filter clusters by search term (client-side filtering example)
  const filteredClusters = searchQuery.trim() 
    ? clusters.filter(cluster => 
        `Cluster-${cluster.cluster_number}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cluster.representativeDomain?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : clusters;

  return (
    <Layout title="All Clusters - Domain Analysis">
      <div className="w-full max-w-6xl mx-auto">
        <ClusterBreadcrumbs 
          items={[
            { label: 'Dashboard', href: '/' },
            { label: 'Clusters' }
          ]} 
        />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Clusters</h1>
            <p className="text-gray-500 mt-1">
              Browse and analyze domain clusters across all sets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Download size={16} />
              <span>Export</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => {
                setCurrentPage(1);
                setClusters([]);
                setLoading(true);
                // Refetch data
              }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <form onSubmit={handleSearch}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      type="text" 
                      placeholder="Search clusters..." 
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Cluster Set</label>
                <Select value={clusterSetFilter} onValueChange={setClusterSetFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cluster set" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cluster Sets</SelectItem>
                    {clusterSets.map(set => (
                      <SelectItem key={set.id} value={set.id.toString()}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Advanced Filters</label>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Filter size={16} />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clusters Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Domain Clusters</CardTitle>
                <CardDescription>
                  Showing {filteredClusters.length} of {clusters.length} clusters
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : filteredClusters.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p>No clusters found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cluster ID</TableHead>
                      <TableHead>Cluster Set</TableHead>
                      <TableHead>Representative Domain</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Diversity</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClusters.map((cluster) => (
                      <TableRow key={cluster.id}>
                        <TableCell className="font-medium">Cluster-{cluster.cluster_number}</TableCell>
                        <TableCell>
                          <Link 
                            href={`/cluster_sets/${cluster.cluster_set_id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {cluster.cluster_set_name || 'Unknown Set'}
                          </Link>
                        </TableCell>
                        <TableCell>{cluster.representativeDomain || 'N/A'}</TableCell>
                        <TableCell className="text-right">{cluster.size || '?'}</TableCell>
                        <TableCell className="text-right">{formatPercentage(cluster.taxonomic_diversity)}</TableCell>
                        <TableCell className="text-center">
                          {cluster.requires_new_classification ? (
                            <Badge className="bg-yellow-500">Review Needed</Badge>
                          ) : (
                            <Badge className="bg-green-500">Valid</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/clusters/${cluster.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex gap-1">
                <button 
                  className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button 
                      key={pageNum}
                      className={`px-3 py-1 border rounded ${currentPage === pageNum ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-50'}`}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ClustersIndexPage;