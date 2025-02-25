// pages/cluster_sets/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, Download, Filter, Search, RefreshCw, BarChart2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '@/components/Layout';
import apiService from '@/services/api';

const ClusterSetDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [clusterSet, setClusterSet] = useState<{
    id: number;
    name: string;
    method: string;
    sequence_identity: number;
    description?: string;
    created_at: string;
    band_width?: number;
    word_length?: number;
    min_length?: number;
  } | null>(null);
  
  const [clusters, setClusters] = useState<Array<{
    id: number;
    cluster_number: number;
    size: number;
    taxonomicDiversity?: number;
    structureConsistency?: number;
    requiresNewClassification?: boolean;
    representativeDomain?: string;
  }> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clustersPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('clusters');
  const [refreshing, setRefreshing] = useState(false);
  const [taxonomyData, setTaxonomyData] = useState<any>(null);
  const [tgroupData, setTgroupData] = useState<any>(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Fetch cluster set data on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchClusterSetData = async () => {
      try {
        setLoading(true);
        // Fetch cluster set details
        const setData = await apiService.getClusterSet(Number(id));
        setClusterSet(setData);
        
        // Fetch clusters for this set
        const clustersData = await apiService.getClusters({ clusterset_id: Number(id), page: 1, limit: 100 });
        setClusters(clustersData.clusters);
        
        // Fetch taxonomy and tgroup distribution (simulated here - replace with actual API calls)
        // These would be actual API calls in a real implementation
        setTaxonomyData([
          { kingdom: 'Bacteria', count: 3421 },
          { kingdom: 'Eukaryota', count: 5648 },
          { kingdom: 'Archaea', count: 923 },
          { kingdom: 'Viruses', count: 178 }
        ]);
        
        setTgroupData([
          { tgroup: 'Alpha/Beta Hydrolases', count: 432 },
          { tgroup: 'Immunoglobulin-like', count: 386 },
          { tgroup: 'Rossmann Fold', count: 325 },
          { tgroup: 'TIM Barrels', count: 287 },
          { tgroup: 'Beta Propellers', count: 219 },
          { tgroup: 'Other', count: 1248 }
        ]);
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cluster set data:', err);
        setError('Failed to load cluster set data. Please try again later.');
        setLoading(false);
      }
    };

    fetchClusterSetData();
  }, [id]);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (refreshing || !id) return;
    
    setRefreshing(true);
    try {
      // Refresh cluster set details
      const setData = await apiService.getClusterSet(Number(id));
      setClusterSet(setData);
      
      // Refresh clusters for this set
      const clustersData = await apiService.getClusters({ clusterset_id: Number(id), page: 1, limit: 100 });
      setClusters(clustersData.clusters);
      
      setError(null);
    } catch (err) {
      console.error('Error refreshing cluster set data:', err);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter clusters based on search query
  const filteredClusters = clusters?.filter(cluster => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      cluster.cluster_number.toString().includes(searchLower) ||
      (cluster.representativeDomain && cluster.representativeDomain.toLowerCase().includes(searchLower))
    );
  }) || [];

  // Pagination
  const indexOfLastCluster = currentPage * clustersPerPage;
  const indexOfFirstCluster = indexOfLastCluster - clustersPerPage;
  const currentClusters = filteredClusters.slice(indexOfFirstCluster, indexOfLastCluster);
  const totalPages = Math.ceil(filteredClusters.length / clustersPerPage);

  if (loading) {
    return (
      <Layout title="Loading Cluster Set Data">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !clusterSet) {
    return (
      <Layout title="Error - Cluster Set Data">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="mt-2">{error || 'Failed to load cluster set data'}</p>
          <Link href="/cluster_sets" passHref>
            <Button className="mt-4">
              Return to Cluster Sets
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${clusterSet.name} - Cluster Set Detail`}
      description={`Details for cluster set ${clusterSet.name} with ${formatPercentage(clusterSet.sequence_identity)} sequence identity threshold`}
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/cluster_sets"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Back to Cluster Sets</span>
          </Link>
        </div>
        
        {/* Cluster Set Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{clusterSet.name}</h1>
            <p className="text-gray-500 mt-1">
              {clusterSet.description || `Cluster set created using ${clusterSet.method} with ${formatPercentage(clusterSet.sequence_identity)} identity threshold`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1" onClick={() => alert('Export functionality would go here')}>
              <Download size={16} />
              <span>Export</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Cluster Set Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Identity Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{formatPercentage(clusterSet.sequence_identity)}</div>
                <Badge className={
                  clusterSet.sequence_identity >= 0.9 ? 'bg-green-500' :
                  clusterSet.sequence_identity >= 0.7 ? 'bg-blue-500' :
                  'bg-yellow-500'
                }>
                  {clusterSet.sequence_identity >= 0.9 ? 'High' :
                   clusterSet.sequence_identity >= 0.7 ? 'Medium' :
                   'Low'}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Minimum sequence identity for clustering
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Clusters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clusters?.length || 0}</div>
              <div className="text-sm text-gray-500 mt-2">
                Domains grouped into clusters
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{clusterSet.method}</div>
              <div className="text-sm text-gray-500 mt-2">
                Clustering algorithm used
              </div>
              {clusterSet.method === 'cdhit' && (
                <div className="mt-2 text-xs text-gray-500">
                  <div><span className="font-medium">Band width:</span> {clusterSet.band_width || 20}</div>
                  <div><span className="font-medium">Word length:</span> {clusterSet.word_length || 5}</div>
                  <div><span className="font-medium">Min length:</span> {clusterSet.min_length || 10}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for different views */}
        <Tabs defaultValue="clusters" className="w-full" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
          </TabsList>
          
          {/* Clusters Tab */}
          <TabsContent value="clusters" className="pt-2">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="text" 
                  placeholder="Search clusters by number or representative domain..." 
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Clusters in {clusterSet.name}</CardTitle>
                    <CardDescription>
                      {filteredClusters.length} clusters found {searchQuery ? 'matching your search' : ''}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredClusters.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <p>No clusters found matching your search criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cluster #</TableHead>
                          <TableHead>Representative Domain</TableHead>
                          <TableHead className="text-right">Size</TableHead>
                          <TableHead className="text-right">Taxonomic Diversity</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentClusters.map((cluster) => (
                          <TableRow key={cluster.id}>
                            <TableCell className="font-medium">Cluster-{cluster.cluster_number}</TableCell>
                            <TableCell>{cluster.representativeDomain || 'N/A'}</TableCell>
                            <TableCell className="text-right">{cluster.size}</TableCell>
                            <TableCell className="text-right">{formatPercentage(cluster.taxonomicDiversity)}</TableCell>
                            <TableCell className="text-center">
                              {cluster.requiresNewClassification ? (
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
                    Showing {indexOfFirstCluster + 1} to {Math.min(indexOfLastCluster, filteredClusters.length)} of {filteredClusters.length} clusters
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
          </TabsContent>
          
          {/* Distributions Tab */}
          <TabsContent value="distributions" className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taxonomic Distribution</CardTitle>
                  <CardDescription>Distribution of domains across taxonomy</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {taxonomyData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taxonomyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="kingdom" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Domains" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex justify-center items-center">
                      <div className="text-center">
                        <Info size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No taxonomic data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>T-Group Distribution</CardTitle>
                  <CardDescription>Domain distribution across structural groups</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {tgroupData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tgroupData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="tgroup"
                          label={({ tgroup, percent }) => 
                            `${tgroup && tgroup.length > 15 ? tgroup.substring(0, 15) + '...' : tgroup} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {tgroupData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => {
                          if (!props || !props.payload) return [value, name];
                          return [`${value} domains`, props.payload.tgroup];
                        }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex justify-center items-center">
                      <div className="text-center">
                        <Info size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No T-group data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Cluster Size Distribution</CardTitle>
                  <CardDescription>Distribution of clusters by member count</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {clusters ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        // Group clusters by size range
                        [
                          { range: '1-10', count: clusters.filter(c => c.size > 0 && c.size <= 10).length },
                          { range: '11-50', count: clusters.filter(c => c.size > 10 && c.size <= 50).length },
                          { range: '51-100', count: clusters.filter(c => c.size > 50 && c.size <= 100).length },
                          { range: '101-500', count: clusters.filter(c => c.size > 100 && c.size <= 500).length },
                          { range: '501+', count: clusters.filter(c => c.size > 500).length }
                        ]
                      }>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Number of Clusters" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex justify-center items-center">
                      <div className="text-center">
                        <Info size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">No cluster data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Parameters Tab */}
          <TabsContent value="parameters" className="pt-2">
            <Card>
              <CardHeader>
                <CardTitle>Clustering Parameters</CardTitle>
                <CardDescription>Configuration used for domain clustering</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                        <div className="font-medium text-gray-500">Cluster Set ID</div>
                        <div>{clusterSet.id}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                        <div className="font-medium text-gray-500">Name</div>
                        <div>{clusterSet.name}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                        <div className="font-medium text-gray-500">Clustering Method</div>
                        <div>{clusterSet.method}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                        <div className="font-medium text-gray-500">Sequence Identity</div>
                        <div>{formatPercentage(clusterSet.sequence_identity)}</div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                        <div className="font-medium text-gray-500">Created</div>
                        <div>{new Date(clusterSet.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Algorithm Parameters</h3>
                    {clusterSet.method === 'cdhit' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                          <div className="font-medium text-gray-500">Band Width</div>
                          <div>{clusterSet.band_width || 20}</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                          <div className="font-medium text-gray-500">Word Length</div>
                          <div>{clusterSet.word_length || 5}</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                          <div className="font-medium text-gray-500">Min Length</div>
                          <div>{clusterSet.min_length || 10}</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                          <div className="font-medium text-gray-500">Tolerance</div>
                          <div>2</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-gray-100 pb-2">
                          <div className="font-medium text-gray-500">Description Length</div>
                          <div>20</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No additional parameters available for {clusterSet.method}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Description</h3>
                  <p className="text-gray-700">
                    {clusterSet.description || 
                      `This cluster set was created using the ${clusterSet.method} algorithm with a sequence identity threshold of ${formatPercentage(clusterSet.sequence_identity)}. It contains approximately ${clusters?.length || 0} clusters of protein domains grouped based on sequence similarity.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClusterSetDetailPage;