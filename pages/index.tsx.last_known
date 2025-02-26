// pages/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Database, 
  BarChart2, 
  Grid, 
  Layers,
  AlertTriangle,
  RefreshCw,
  Download,
  Circle,
  Info,
  Settings
} from 'lucide-react';

// Import UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Navbar from '@/components/Navbar';

// Import API service
import apiService from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function DomainClusterDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterSet, setSelectedClusterSet] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // State for each section of data
  const [summaryData, setSummaryData] = useState<{
    totalClusters: number;
    totalDomains: number;
    needsReview: number;
  } | null>(null);
  
  const [clusterSetsData, setClusterSetsData] = useState<Array<{
    id: number;
    name: string;
    clusters: number;
    domains: number;
    taxonomicCoverage: number;
  }> | null>(null);
  
  const [taxonomyData, setTaxonomyData] = useState<{
    taxonomyStats: Array<{
      kingdom: string;
      domains: number;
      clusters: number;
    }>;
    tgroupDistribution: Array<{
      tgroup: string;
      count: number;
    }>;
  } | null>(null);
  
  const [activityData, setActivityData] = useState<Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }> | null>(null);
  
  const [reclassificationsData, setReclassificationsData] = useState<Array<{
    id: string;
    name: string;
    currentTGroup: string;
    proposedTGroup: string;
    confidence: string;
  }> | null>(null);
  
  const [recentClustersData, setRecentClustersData] = useState<Array<{
    id: string;
    name: string;
    size: number;
    taxonomicDiversity: number;
    representativeDomain: string;
  }> | null>(null);

  // Loading states
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [clusterSetsLoading, setClusterSetsLoading] = useState(true);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [reclassificationsLoading, setReclassificationsLoading] = useState(true);
  const [recentClustersLoading, setRecentClustersLoading] = useState(true);

  // Error states
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [clusterSetsError, setClusterSetsError] = useState<string | null>(null);
  const [taxonomyError, setTaxonomyError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [reclassificationsError, setReclassificationsError] = useState<string | null>(null);
  const [recentClustersError, setRecentClustersError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Format for percentage display
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Fetch data in parallel
  useEffect(() => {
    // Load summary data first (fastest)
    apiService.getDashboardSummary()
      .then(data => {
        setSummaryData(data);
        setSummaryError(null);
      })
      .catch(error => {
        console.error('Error loading summary:', error);
        setSummaryError(error.message);
      })
      .finally(() => setSummaryLoading(false));
    
    // Load other data in parallel
    apiService.getDashboardClusterSets()
      .then(data => {
        setClusterSetsData(data);
        setClusterSetsError(null);
      })
      .catch(error => {
        console.error('Error loading cluster sets:', error);
        setClusterSetsError(error.message);
      })
      .finally(() => setClusterSetsLoading(false));
    
    apiService.getDashboardTaxonomy()
      .then(data => {
        setTaxonomyData(data);
        setTaxonomyError(null);
      })
      .catch(error => {
        console.error('Error loading taxonomy data:', error);
        setTaxonomyError(error.message);
      })
      .finally(() => setTaxonomyLoading(false));
    
    apiService.getDashboardActivity()
      .then(data => {
        setActivityData(data);
        setActivityError(null);
      })
      .catch(error => {
        console.error('Error loading activity data:', error);
        setActivityError(error.message);
      })
      .finally(() => setActivityLoading(false));
    
    apiService.getDashboardReclassifications()
      .then(data => {
        setReclassificationsData(data);
        setReclassificationsError(null);
      })
      .catch(error => {
        console.error('Error loading reclassifications:', error);
        setReclassificationsError(error.message);
      })
      .finally(() => setReclassificationsLoading(false));
    
    apiService.getDashboardRecentClusters()
      .then(data => {
        setRecentClustersData(data);
        setRecentClustersError(null);
      })
      .catch(error => {
        console.error('Error loading recent clusters:', error);
        setRecentClustersError(error.message);
      })
      .finally(() => setRecentClustersLoading(false));
  }, []);

  // Handle refresh for a specific section
  const handleRefreshSection = async (section: string) => {
    if (refreshing) return;
    
    setRefreshing(true);
    
    try {
      switch(section) {
        case 'summary':
          setSummaryLoading(true);
          setSummaryData(await apiService.getDashboardSummary());
          setSummaryError(null);
          setSummaryLoading(false);
          break;
        case 'clustersets':
          setClusterSetsLoading(true);
          setClusterSetsData(await apiService.getDashboardClusterSets());
          setClusterSetsError(null);
          setClusterSetsLoading(false);
          break;
        case 'taxonomy':
          setTaxonomyLoading(true);
          setTaxonomyData(await apiService.getDashboardTaxonomy());
          setTaxonomyError(null);
          setTaxonomyLoading(false);
          break;
        case 'activity':
          setActivityLoading(true);
          setActivityData(await apiService.getDashboardActivity());
          setActivityError(null);
          setActivityLoading(false);
          break;
        case 'reclassifications':
          setReclassificationsLoading(true);
          setReclassificationsData(await apiService.getDashboardReclassifications());
          setReclassificationsError(null);
          setReclassificationsLoading(false);
          break;
        case 'recentclusters':
          setRecentClustersLoading(true);
          setRecentClustersData(await apiService.getDashboardRecentClusters());
          setRecentClustersError(null);
          setRecentClustersLoading(false);
          break;
        case 'all':
          // Refresh all sections in parallel
          await Promise.all([
            apiService.getDashboardSummary().then(setSummaryData).catch(() => {}),
            apiService.getDashboardClusterSets().then(setClusterSetsData).catch(() => {}),
            apiService.getDashboardTaxonomy().then(setTaxonomyData).catch(() => {}),
            apiService.getDashboardActivity().then(setActivityData).catch(() => {}),
            apiService.getDashboardReclassifications().then(setReclassificationsData).catch(() => {}),
            apiService.getDashboardRecentClusters().then(setRecentClustersData).catch(() => {})
          ]);
          break;
      }
    } catch (error) {
      console.error(`Error refreshing ${section} data:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Format action text with appropriate color
  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      reclassified: 'bg-purple-500',
      validated: 'bg-green-500',
      flagged: 'bg-yellow-500',
      created: 'bg-blue-500',
      updated: 'bg-gray-500'
    };
    
    return (
      <Badge className={colorMap[action] || 'bg-gray-500'}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  // Filter cluster sets based on selection
  const filteredClusterSets = selectedClusterSet === 'all' 
    ? clusterSetsData 
    : clusterSetsData?.filter(set => set.id.toString() === selectedClusterSet) || [];

  // Check if all essential data is still loading
  const initialLoading = summaryLoading && clusterSetsLoading && taxonomyLoading;

  // Render loading skeleton if all essential data is loading
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Domain Cluster Analysis Dashboard</title>
        <meta name="description" content="Dashboard for analyzing protein domain clusters" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Layers className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Domain Cluster Analysis</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search domains, clusters, or T-groups..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings size={16} />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global error states have been replaced with per-section error handling */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {summaryLoading ? (
            // Show skeletons while loading
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : summaryError ? (
            // Show error message
            <div className="col-span-3 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p>{summaryError}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => handleRefreshSection('summary')}
                disabled={refreshing}
              >
                {refreshing ? 'Trying again...' : 'Try Again'}
              </Button>
            </div>
          ) : (
            // Show actual summary cards
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Clusters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{summaryData?.totalClusters.toLocaleString()}</div>
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Across {clusterSetsData?.length || 0} cluster sets
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{summaryData?.totalDomains.toLocaleString()}</div>
                    <Grid className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    With sequence and structure data
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Needs Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">{summaryData?.needsReview}</div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Clusters flagged for reclassification
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Taxonomy and T-Group Charts */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Cluster Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedClusterSet} 
                      onValueChange={setSelectedClusterSet}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select cluster set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cluster Sets</SelectItem>
                        {clusterSetsData?.map(set => (
                          <SelectItem key={set.id} value={set.id.toString()}>
                            {set.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleRefreshSection('taxonomy')}
                      disabled={refreshing || taxonomyLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing || taxonomyLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Distribution of domains across taxonomy and structural groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {taxonomyLoading ? (
                  <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                      <p className="text-gray-500">Loading taxonomy data...</p>
                    </div>
                  </div>
                ) : taxonomyError ? (
                  <div className="h-80 bg-red-50 rounded-md flex items-center justify-center p-4">
                    <div className="flex flex-col items-center space-y-2 text-red-700">
                      <AlertTriangle className="h-8 w-8" />
                      <p>{taxonomyError}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRefreshSection('taxonomy')}
                        disabled={refreshing}
                      >
                        {refreshing ? 'Trying again...' : 'Try Again'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="taxonomic">
                    <TabsList className="mb-4">
                      <TabsTrigger value="taxonomic">Taxonomic Distribution</TabsTrigger>
                      <TabsTrigger value="structural">Structural Groups</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="taxonomic">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={taxonomyData?.taxonomyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="kingdom" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="domains" name="Domains" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="clusters" name="Clusters" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="structural">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={taxonomyData?.tgroupDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="tgroup"
                              label={({ tgroup, percent }) => 
                                `${tgroup && tgroup.length > 15 ? tgroup.substring(0, 15) + '...' : tgroup} (${(percent ? percent * 100 : 0).toFixed(0)}%)`
                              }
                            >
                              {taxonomyData?.tgroupDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => {
                              if (!props || !props.payload) return [value, name];
                              return [`${value} clusters`, props.payload.tgroup];
                            }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Cluster Sets Table */}
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
                    onClick={() => handleRefreshSection('clustersets')}
                    disabled={refreshing || clusterSetsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing || clusterSetsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {clusterSetsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : clusterSetsError ? (
                  <div className="p-4 bg-red-50 rounded-md text-red-700">
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    <p>{clusterSetsError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRefreshSection('clustersets')}
                      disabled={refreshing}
                    >
                      {refreshing ? 'Trying again...' : 'Try Again'}
                    </Button>
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
                        {filteredClusterSets.map((set, index) => (
                          <tr key={set.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 px-4 font-medium">{set.name}</td>
                            <td className="py-2 px-4 text-right">{set.clusters.toLocaleString()}</td>
                            <td className="py-2 px-4 text-right">{set.domains.toLocaleString()}</td>
                            <td className="py-2 px-4 text-right">{formatPercentage(set.taxonomicCoverage)}</td>
                            <td className="py-2 px-4 text-center">
                              <Link 
                                href={`/cluster-sets/${set.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
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
              </CardContent>
            </Card>

            {/* Recent Clusters */}
            <Card>
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
                    onClick={() => handleRefreshSection('recentclusters')}
                    disabled={refreshing || recentClustersLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing || recentClustersLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentClustersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recentClustersError ? (
                  <div className="p-4 bg-red-50 rounded-md text-red-700">
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    <p>{recentClustersError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRefreshSection('recentclusters')}
                      disabled={refreshing}
                    >
                      {refreshing ? 'Trying again...' : 'Try Again'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentClustersData?.map((cluster) => (
                      <div key={cluster.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex justify-between">
                          <Link href={`/clusters/${cluster.id}`} className="text-lg font-medium text-blue-600 hover:text-blue-800">
                            {cluster.name}
                          </Link>
                          <Badge>{cluster.size} members</Badge>
                        </div>
                        <div className="grid grid-cols-2 mt-2 text-sm">
                          <div>
                            <span className="text-gray-500">Representative:</span> {cluster.representativeDomain}
                          </div>
                          <div>
                            <span className="text-gray-500">Taxonomic Diversity:</span> {formatPercentage(cluster.taxonomicDiversity)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Link href="/clusters" className="text-blue-600 hover:text-blue-800 text-sm">
                        View all clusters
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleRefreshSection('activity')}
                    disabled={refreshing || activityLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing || activityLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : activityError ? (
                  <div className="p-4 bg-red-50 rounded-md text-red-700">
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    <p>{activityError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRefreshSection('activity')}
                      disabled={refreshing}
                    >
                      {refreshing ? 'Trying again...' : 'Try Again'}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {activityData?.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="relative mt-1">
                            <Circle className="h-2 w-2 text-blue-500" fill="#3b82f6" />
                            {index !== (activityData.length - 1) && (
                              <div className="absolute top-2 bottom-0 left-1 -ml-px w-0.5 bg-gray-200 h-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <Link href={`/clusters/${activity.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                {activity.id}
                              </Link>
                              <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              {getActionBadge(activity.action)}
                              <span className="text-xs text-gray-500 ml-2">by {activity.user}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link href="/activity" className="text-blue-600 hover:text-blue-800 text-sm">
                        View all activity
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pending Reclassifications */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Reclassifications</CardTitle>
                    <CardDescription>
                      Clusters that need taxonomic review
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleRefreshSection('reclassifications')}
                    disabled={refreshing || reclassificationsLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing || reclassificationsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reclassificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : reclassificationsError ? (
                  <div className="p-4 bg-red-50 rounded-md text-red-700">
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    <p>{reclassificationsError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRefreshSection('reclassifications')}
                      disabled={refreshing}
                    >
                      {refreshing ? 'Trying again...' : 'Try Again'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reclassificationsData?.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <Link href={`/clusters/${item.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {item.name}
                        </Link>
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                          <div>
                            <span className="text-gray-500">Current:</span> {item.currentTGroup}
                          </div>
                          <div>
                            <span className="text-gray-500">Proposed:</span> {item.proposedTGroup}
                          </div>
                        </div>
                        <div className="mt-1">
                          <Badge className={
                            item.confidence === 'high' ? 'bg-green-500' : 
                            item.confidence === 'medium' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }>
                            {item.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Link href="/reclassifications" className="text-blue-600 hover:text-blue-800 text-sm">
                        View all reclassifications
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Run Taxonomy Analysis
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Clusters
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Domain Data
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => handleRefreshSection('all')}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Domain Cluster Analysis Dashboard • {new Date().getFullYear()}
            </div>
            <div className="text-sm text-gray-500">
              Database last updated: February 20, 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}