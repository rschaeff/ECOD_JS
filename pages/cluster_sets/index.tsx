// pages/cluster_sets/index.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart2, Download, Filter, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import apiService from '@/services/api';

const ClusterSetsPage = () => {
  const [clusterSets, setClusterSets] = useState<Array<{
    id: number;
    name: string;
    method: string;
    sequence_identity: number;
    clusters: number;
    domains: number;
    taxonomicCoverage: number;
    description?: string;
    created_at: string;
  }> | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [identityFilter, setIdentityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cluster sets data on component mount
  useEffect(() => {
    const fetchClusterSets = async () => {
      try {
        setLoading(true);
        const data = await apiService.getClusterSets();
        setClusterSets(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cluster sets:', err);
        setError('Failed to load cluster sets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClusterSets();
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const data = await apiService.getClusterSets();
      setClusterSets(data);
      setError(null);
    } catch (err) {
      console.error('Error refreshing cluster sets:', err);
      setError('Failed to refresh cluster sets data. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Handle CSV export of cluster sets
  const handleExportCSV = () => {
    if (!clusterSets) return;

    // Create CSV content
    const headers = ['ID', 'Name', 'Method', 'Sequence Identity', 'Clusters', 'Domains', 'Taxonomic Coverage', 'Description', 'Created At'];
    const rows = clusterSets.map(set => [
      set.id,
      set.name,
      set.method,
      formatPercentage(set.sequence_identity),
      set.clusters,
      set.domains,
      formatPercentage(set.taxonomicCoverage),
      set.description || '',
      new Date(set.created_at).toLocaleDateString()
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

  // Filter cluster sets based on search query and identity filter
  const filteredClusterSets = clusterSets?.filter(set => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (set.description && set.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Identity filter
    const matchesIdentity = identityFilter === 'all' || 
      (identityFilter === 'high' && set.sequence_identity >= 0.9) ||
      (identityFilter === 'medium' && set.sequence_identity >= 0.7 && set.sequence_identity < 0.9) ||
      (identityFilter === 'low' && set.sequence_identity < 0.7);
    
    return matchesSearch && matchesIdentity;
  }) || [];

  return (
    <Layout 
      title="Cluster Sets - Domain Cluster Analysis"
      description="Browse and analyze domain cluster sets at different sequence identity thresholds"
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with title and actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cluster Sets</h1>
            <p className="text-gray-500 mt-1">
              Browse domain cluster sets at different sequence identity thresholds
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleExportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="text" 
                    placeholder="Search by name or description..." 
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sequence Identity</label>
                <Select value={identityFilter} onValueChange={setIdentityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select identity threshold" />
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
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Trying again...' : 'Try Again'}
            </Button>
          </div>
        )}

        {/* Cluster sets table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Available Cluster Sets</CardTitle>
                <CardDescription>
                  {filteredClusterSets.length} sets found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredClusterSets.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p>No cluster sets found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-center">Identity Threshold</TableHead>
                      <TableHead className="text-right">Clusters</TableHead>
                      <TableHead className="text-right">Domains</TableHead>
                      <TableHead className="text-center">Taxonomic Coverage</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClusterSets.map((set, index) => (
                      <TableRow key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <TableCell className="font-medium">{set.name}</TableCell>
                        <TableCell>{set.method}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={
                            set.sequence_identity >= 0.9 ? 'bg-green-500' :
                            set.sequence_identity >= 0.7 ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }>
                            {formatPercentage(set.sequence_identity)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{set.clusters.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{set.domains.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{formatPercentage(set.taxonomicCoverage)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Link
                              href={`/cluster_sets/${set.id}`}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View
                            </Link>
                            <Link
                              href={`/cluster_sets/${set.id}/analysis`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Analyze
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Section */}
        {clusterSets && clusterSets.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clusters per Set</CardTitle>
                <CardDescription>Number of clusters in each set</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex justify-center items-center">
                  <BarChart2 className="h-16 w-16 text-gray-300 mb-2" />
                  <p className="text-gray-500">Interactive chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Identity Threshold Distribution</CardTitle>
                <CardDescription>Distribution of sequence identity thresholds</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex justify-center items-center">
                  <BarChart2 className="h-16 w-16 text-gray-300 mb-2" />
                  <p className="text-gray-500">Interactive chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClusterSetsPage;