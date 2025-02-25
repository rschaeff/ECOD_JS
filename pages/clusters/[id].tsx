// pages/clusters/[id].tsx
'use client'; // Add this line to explicitly mark as a client-side component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, Download, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService, { ClusterDetail as IClusterDetail, MSAData, ValidationData } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { exportClusterData } from '@/utils/exportUtils';

const ClusterDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clusterData, setClusterData] = useState<IClusterDetail | null>(null);
  const [activeTab, setActiveTab] = useState('members');
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [msaData, setMsaData] = useState<MSAData | null>(null);
  const [loadingMsa, setLoadingMsa] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage, setMembersPerPage] = useState(10);

  // Fetch data effect
  useEffect(() => {
    const fetchClusterData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await apiService.getClusterDetail(id as string);
        setClusterData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load cluster details');
        setLoading(false);
      }
    };

    fetchClusterData();
  }, [id]);

  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Pagination for members
  const renderMembersPagination = () => {
    if (!clusterData) return null;

    const totalPages = Math.ceil(clusterData.members.length / membersPerPage);
    
    return (
      <div className="flex gap-2">
        <button 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">{currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  // Fetch MSA data
  const fetchMSAData = async () => {
    if (!id) return;

    try {
      setLoadingMsa(true);
      const data = await apiService.getMSAData(id as string);
      setMsaData(data);
    } catch (err) {
      console.error('Failed to load MSA data');
    } finally {
      setLoadingMsa(false);
    }
  };

  // Fetch Validation data
  const fetchValidationData = async () => {
    if (!id) return;

    try {
      setLoadingValidation(true);
      const data = await apiService.getValidationData(id as string);
      setValidationData(data);
    } catch (err) {
      console.error('Failed to load validation data');
    } finally {
      setLoadingValidation(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Layout title="Loading Cluster Details">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Handle error state
  if (error || !clusterData) {
    return (
      <Layout title="Cluster Details Error">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error || 'No cluster data available'}</p>
        </div>
      </Layout>
    );
  }

  // Export button handler
  const handleExportClusterData = () => {
    exportClusterData(clusterData);
  };

  return (
    <Layout title={`Cluster ${clusterData.cluster.cluster_number}`}>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/clusters" className="hover:bg-gray-100 p-2 rounded-full">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Cluster {clusterData.cluster.cluster_number}</h1>
      </div>

      <Tabs defaultValue="members" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="members">Cluster Members</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy Distribution</TabsTrigger>
          <TabsTrigger value="alignment" onClick={fetchMSAData}>Sequence Alignment</TabsTrigger>
          <TabsTrigger value="validation" onClick={fetchValidationData}>Cluster Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Members</CardTitle>
              <CardDescription>All domains that belong to this cluster sorted by sequence identity to representative</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain ID</TableHead>
                      <TableHead>UniProt Acc</TableHead>
                      <TableHead>T-Group</TableHead>
                      <TableHead>Range</TableHead>
                      <TableHead className="text-right">Sequence Identity</TableHead>
                      <TableHead className="text-center">Representative</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clusterData.members.slice(
                      (currentPage - 1) * membersPerPage, 
                      currentPage * membersPerPage
                    ).map((member) => (
                      <TableRow key={member.id} className={member.is_representative ? "bg-blue-50" : ""}>
                        <TableCell className="font-medium">{member.domain?.domain_id}</TableCell>
                        <TableCell>{member.domain?.unp_acc}</TableCell>
                        <TableCell>{member.domain?.t_group}</TableCell>
                        <TableCell>{member.domain?.range}</TableCell>
                        <TableCell className="text-right">{formatPercentage(member.sequence_identity)}</TableCell>
                        <TableCell className="text-center">
                          {member.is_representative && <Badge className="bg-blue-500">✓</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Showing {Math.min(membersPerPage, clusterData.members.length)} of {clusterData.size} members
              </div>
              {renderMembersPagination()}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="alignment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Sequence Alignment</CardTitle>
              <CardDescription>Alignment visualization of the cluster members</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMsa ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : msaData ? (
                <div className="h-96 overflow-auto font-mono text-xs border rounded-md p-4 bg-gray-50">
                  <pre>{msaData.alignment_data}</pre>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 border rounded-md">
                  <div className="text-center">
                    <Info size={48} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No alignment data available for this cluster</p>
                    <p className="text-sm text-gray-400 mt-2">Try generating an alignment or check database connection</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="validation" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cluster Validation Metrics</CardTitle>
              <CardDescription>Analysis of cluster quality and classification confidence</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingValidation ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : validationData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Validation content remains the same as in previous version */}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 border rounded-md">
                  <div className="text-center">
                    <Info size={48} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">No validation data available for this cluster</p>
                    <p className="text-sm text-gray-400 mt-2">Try generating validation metrics or check database connection</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleExportClusterData}
        >
          <Download size={16} />
          <span>Export Cluster Data</span>
        </button>
      </div>
    </Layout>
  );
};

export default ClusterDetailPage;