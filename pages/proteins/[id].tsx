// pages/proteins/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, Download, Dna, Globe, FileText, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import apiService, { ProteinDomains } from '@/services/api';

const ProteinDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proteinData, setProteinData] = useState<ProteinDomains | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load protein data
  useEffect(() => {
    if (!id) return;
    
    const fetchProteinData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getProteinDomains(id as string);
        setProteinData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching protein details:', err);
        setError('Failed to load protein details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProteinData();
  }, [id]);
  
  // Filter domains based on search query
  const filteredDomains = proteinData?.domains.filter(domain => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      domain.domain_id.toLowerCase().includes(searchLower) ||
      domain.t_group?.toLowerCase().includes(searchLower) ||
      domain.t_group_name?.toLowerCase().includes(searchLower) ||
      domain.range?.toLowerCase().includes(searchLower)
    );
  });
  
  // Render loading state
  if (loading) {
    return (
      <Layout title="Loading Protein Details">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  // Render error state
  if (error || !proteinData) {
    return (
      <Layout title="Protein Details Error">
        <div className="flex justify-center items-center h-64 flex-col">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
          <p className="text-red-500">{error || 'Protein data not available'}</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Check if no protein was found
  if (!proteinData.protein) {
    return (
      <Layout title="Protein Not Found">
        <div className="flex justify-center items-center h-64 flex-col">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
          <p className="text-lg font-medium">Protein not found</p>
          <p className="text-gray-500 mt-2">No protein was found with the identifier: {id}</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </Layout>
    );
  }
  
  const { protein, structure, domains, count } = proteinData;
  
  return (
    <Layout title={`Protein ${protein.unp_acc || protein.source_id}`}>
      {/* Header section */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="hover:bg-gray-100 p-2 rounded-full">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">
            {protein.unp_acc || protein.source_id}
          </h1>
          {protein.species && (
            <Badge className="ml-2 bg-green-500">
              {protein.species}
            </Badge>
          )}
        </div>
        <p className="text-gray-500 ml-12">
          {protein.unp_acc && (
            <>
              UniProt: 
              <a 
                href={`https://www.uniprot.org/uniprot/${protein.unp_acc}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mx-1"
              >
                {protein.unp_acc}
              </a> • 
            </>
          )}
          {protein.source_id && protein.source_id !== protein.unp_acc && (
            <>
              Source ID: {protein.source_id} • 
            </>
          )}
          Length: {protein.sequence_length} aa • 
          Domains: {count}
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center">
              <Dna className="h-4 w-4 mr-1" /> Protein Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Length:</span>
                <span className="font-medium">{protein.sequence_length} aa</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Domains:</span>
                <span className="font-medium">{count}</span>
              </div>
              <div className="flex justify-between">
                <span>Domain Coverage:</span>
                <span className="font-medium">
                  {calculateDomainCoverage(domains, protein.sequence_length)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {protein.tax_id && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center">
                <Globe className="h-4 w-4 mr-1" /> Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Organism:</span>
                  <span className="font-medium">{protein.species}</span>
                </div>
                <div className="flex justify-between">
                  <span>NCBI Taxonomy ID:</span>
                  <a 
                    href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${protein.tax_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center"
                  >
                    {protein.tax_id}
                    <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {structure && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Structure Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Structure Type:</span>
                  <span className="font-medium capitalize">
                    {structure.source}
                  </span>
                </div>
                {structure.resolution && (
                  <div className="flex justify-between mb-1">
                    <span>Resolution:</span>
                    <span className="font-medium">{structure.resolution} Å</span>
                  </div>
                )}
                {structure.confidence_score && (
                  <div className="flex justify-between">
                    <span>Confidence Score:</span>
                    <span className="font-medium">{(structure.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Domains Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Protein Domains</CardTitle>
              <CardDescription>
                {count} domains found in this protein
              </CardDescription>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="text" 
                  placeholder="Search domains..." 
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No domains found for this protein.</p>
            </div>
          ) : filteredDomains && filteredDomains.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No domains match your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain ID</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>T-Group</TableHead>
                    <TableHead className="text-center">Classification</TableHead>
                    <TableHead className="text-center">Structure</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDomains?.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-medium">{domain.domain_id}</TableCell>
                      <TableCell>{domain.range}</TableCell>
                      <TableCell>
                        {domain.t_group} 
                        {domain.t_group_name && (
                          <span className="text-gray-500 text-xs block">
                            {domain.t_group_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          domain.judge === 'good_domain' ? 'bg-green-500' :
                          domain.judge === 'simple_topology' ? 'bg-blue-500' :
                          domain.judge === 'partial_domain' ? 'bg-yellow-500' :
                          domain.judge === 'low_confidence' ? 'bg-red-500' :
                          'bg-gray-500'
                        }>
                          {domain.judge ? formatJudge(domain.judge) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {domain.has_structure ? (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Available
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Link href={`/domains/${domain.id}`} passHref>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          {domain.primary_cluster_id && (
                            <Link href={`/clusters/${domain.primary_cluster_id}`} passHref>
                              <Button variant="outline" size="sm">Cluster</Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {filteredDomains && (
              <p className="text-sm text-gray-500">
                Showing {filteredDomains.length} of {domains.length} domains
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  );
};

// Helper function to calculate domain coverage percentage
function calculateDomainCoverage(domains: any[], proteinLength: number): string {
  if (!domains || domains.length === 0 || !proteinLength) return '0.0';
  
  // Create an array to track which positions are covered by domains
  const coverage = new Array(proteinLength).fill(false);
  
  // Mark positions covered by domains
  domains.forEach(domain => {
    if (domain.range && domain.range.includes('-')) {
      const [start, end] = domain.range.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= proteinLength) {
        for (let i = start - 1; i < end; i++) {
          coverage[i] = true;
        }
      }
    }
  });
  
  // Calculate percentage
  const coveredPositions = coverage.filter(Boolean).length;
  const percentage = (coveredPositions / proteinLength) * 100;
  
  return percentage.toFixed(1);
}

// Helper function to format judge values
function formatJudge(judge: string): string {
  return judge
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default ProteinDetailPage;
