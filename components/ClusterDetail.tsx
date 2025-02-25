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

const ClusterDetail = () => {
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

  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  // Fetch cluster data on component mount
  useEffect(() => {
    if (!id) return;

    const fetchClusterData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCluster(Number(id));
        setClusterData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching cluster data:', err);
        setError('Failed to load cluster data. Please try again later.');
        setLoading(false);
      }
    };

    fetchClusterData();
  }, [id]);

  // Fetch MSA data when MSA tab is selected
  useEffect(() => {
    if (!id || activeTab !== 'alignment' || msaData || loadingMsa) return;
    
    const fetchMsaData = async () => {
      try {
        setLoadingMsa(true);
        const data = await apiService.getClusterMSA(Number(id));
        setMsaData(data);
        setLoadingMsa(false);
      } catch (err) {
        console.error('Error fetching MSA data:', err);
        setMsaData(null);
        setError('Failed to load alignment data. Please try again later.');
        setLoadingMsa(false);
      }
    };

    fetchMsaData();
  }, [id, activeTab, msaData, loadingMsa]);

  // Fetch validation data when validation tab is selected
  useEffect(() => {
    if (!id || activeTab !== 'validation' || validationData || loadingValidation) return;
    
    const fetchValidationData = async () => {
      try {
        setLoadingValidation(true);
        const data = await apiService.getClusterValidation(Number(id));
        setValidationData(data);
        setLoadingValidation(false);
      } catch (err) {
        console.error('Error fetching validation data:', err);
        setValidationData(null);
        setError('Failed to load validation data. Please try again later.');
        setLoadingValidation(false);
      }
    };

    fetchValidationData();
  }, [id, activeTab, validationData, loadingValidation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !clusterData) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-red-600">Error</h2>
        <p className="mt-2">{error || 'Failed to load cluster data'}</p>
        <Link 
          href="/dashboard/clusters" 
          className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Cluster List
        </Link>
      </div>
    );
  }

  const renderMembersPagination = () => {
    if (!clusterData) return null;
    
    const totalPages = Math.ceil(clusterData.size / membersPerPage);
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex gap-1">
        <button 
          className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400' : 'hover:bg-gray-50'}`}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Show pages around current page
          let pageNum = i + 1;
          if (totalPages > 5 && currentPage > 3) {
            pageNum = currentPage - 3 + i;
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
        
        {totalPages > 5 && currentPage < totalPages - 2 && (
          <>
            <span className="flex items-center">...</span>
            <button 
              className={`px-3 py-1 border rounded hover:bg-gray-50`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button 
          className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400' : 'hover:bg-gray-50'}`}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/dashboard/clusters" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>Back to Cluster List</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-3 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center">
                  Cluster-{clusterData.cluster.cluster_number}
                  {clusterData.analysis?.requires_new_classification && (
                    <Badge className="ml-2 bg-yellow-500">New Classification Needed</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Cluster #{clusterData.cluster.cluster_number} from {clusterData.clusterSet.name} ({formatPercentage(clusterData.clusterSet.sequence_identity)} identity threshold)
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-500">{clusterData.size} Members</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Representative Domain</h3>
                {clusterData.representative ? (
                  <>
                    <p className="text-lg font-semibold">{clusterData.representative.domain?.domain_id}</p>
                    <p className="text-sm">
                      <span className="font-medium">UniProt:</span> {clusterData.representative.domain?.unp_acc}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">T-Group:</span> {clusterData.representative.domain?.t_group}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Range:</span> {clusterData.representative.domain?.range}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No representative domain assigned</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cluster Metrics</h3>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-sm">Taxonomic Diversity:</p>
                    <p className="text-lg font-semibold">{formatPercentage(clusterData.taxonomyDistribution.taxonomicDiversity)}</p>
                  </div>
                  <div>
                    <p className="text-sm">Structure Consistency:</p>
                    <p className="text-lg font-semibold">{formatPercentage(clusterData.analysis?.structure_consistency)}</p>
                  </div>
                  <div>
                    <p className="text-sm">Distinct Families:</p>
                    <p className="text-lg font-semibold">{clusterData.taxonomyDistribution.distinctFamilies}</p>
                  </div>
                  <div>
                    <p className="text-sm">Distinct Phyla:</p>
                    <p className="text-lg font-semibold">{clusterData.taxonomyDistribution.distinctPhyla}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Superkingdoms:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {clusterData.taxonomyDistribution.superkingdoms.map((kingdom, index) => (
                      <Badge key={index} className="bg-green-500">{kingdom}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">T-Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clusterData.tGroupDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="t_group"
                    label={({ t_group, percent }) => `${t_group} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {clusterData.tGroupDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} domains`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="members">Cluster Members</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy Distribution</TabsTrigger>
          <TabsTrigger value="alignment">Sequence Alignment</TabsTrigger>
          <TabsTrigger value="validation">Cluster Validation</TabsTrigger>
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
        
        <TabsContent value="taxonomy" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Phylum Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clusterData.taxonomyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="phylum" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Number of Domains" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Species Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clusterData.speciesDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="species"
                        label={({ species, percent }) => 
                          `${species && species.length > 12 ? species.substring(0, 10) + '...' : species} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {clusterData.speciesDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} domains`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <div>
                    <h3 className="text-lg font-medium mb-2">Structural Validation</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Structure Consistency</span>
                          <span className="text-sm font-medium">{formatPercentage(validationData.structuralValidation.structureConsistency)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${validationData.structuralValidation.structureConsistency * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Based on TM-score comparisons between all structures in cluster</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Experimental Support</span>
                          <span className="text-sm font-medium">{formatPercentage(validationData.structuralValidation.experimentalSupport)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${validationData.structuralValidation.experimentalSupport * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Percentage of domains with experimental structure evidence</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Taxonomic Validation</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Taxonomic Diversity</span>
                          <span className="text-sm font-medium">{formatPercentage(validationData.taxonomicValidation.taxonomicDiversity)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${validationData.taxonomicValidation.taxonomicDiversity * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Weighted measure of taxonomy spread across the cluster</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">T-Group Homogeneity</span>
                          <span className="text-sm font-medium">{formatPercentage(validationData.taxonomicValidation.tgroupHomogeneity)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-orange-500 h-2.5 rounded-full" 
                            style={{ width: `${validationData.taxonomicValidation.tgroupHomogeneity * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Percentage of domains assigned to the most common T-group</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Classification Assessment</h3>
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
                        validationData.classificationAssessment.status === 'Valid' ? 'bg-green-500' :
                        validationData.classificationAssessment.status === 'Invalid' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}>
                        {validationData.classificationAssessment.status}
                      </div>
                      <div>
                        <p className="text-sm">{validationData.classificationAssessment.notes}</p>
                      </div>
                    </div>
                  </div>
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
          onClick={() => {
            if (clusterData) {
              const fileName = `cluster-${clusterData.cluster.cluster_number}-export.json`;
              const data = JSON.stringify(clusterData, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const href = URL.createObjectURL(blob);
              
              const link = document.createElement('a');
              link.href = href;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(href);
            }
          }}
        >
          <Download size={16} />
          <span>Export Cluster Data</span>
        </button>
      </div>
    </div>
  );
};

export default ClusterDetail;
