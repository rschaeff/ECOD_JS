// components/cluster/ClusterDetail/tabs/TaxonomyTab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Info, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ErrorDisplay from '../../shared/ErrorDisplay';

interface TaxonomyTabProps {
  clusterId: number;
  taxonomyStats?: Array<{
    phylum: string;
    count: number;
  }>;
  speciesDistribution?: Array<{
    species: string;
    count: number;
  }>;
  superkingdoms?: string[];
  distinctPhyla?: number;
  distinctFamilies?: number;
  taxonomicDiversity?: number;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const TaxonomyTab: React.FC<TaxonomyTabProps> = ({
  clusterId,
  taxonomyStats = [],
  speciesDistribution = [],
  superkingdoms = [],
  distinctPhyla = 0,
  distinctFamilies = 0,
  taxonomicDiversity = 0,
  isLoading = false,
  error = null,
  onRefresh
}) => {
  // Internal state
  const [activeSubtab, setActiveSubtab] = useState<string>('overview');
  const [chartType, setChartType] = useState<string>('bar');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Define the export function for CSV
  const handleExportCsv = () => {
    if (!taxonomyStats.length && !speciesDistribution.length) return;
    
    let csvContent = '';
    let filename = '';
    
    if (activeSubtab === 'phyla') {
      // Create CSV for phyla data
      csvContent = 'Phylum,Count\n' + 
                   taxonomyStats.map(item => `"${item.phylum}",${item.count}`).join('\n');
      filename = `cluster_${clusterId}_phyla_distribution.csv`;
    } else if (activeSubtab === 'species') {
      // Create CSV for species data
      csvContent = 'Species,Count\n' + 
                   speciesDistribution.map(item => `"${item.species}",${item.count}`).join('\n');
      filename = `cluster_${clusterId}_species_distribution.csv`;
    } else {
      // Create CSV for overview data
      csvContent = 'Metric,Value\n' +
                   `"Taxonomic Diversity",${formatPercentage(taxonomicDiversity)}\n` +
                   `"Distinct Phyla",${distinctPhyla}\n` +
                   `"Distinct Families",${distinctFamilies}\n` +
                   `"Superkingdoms","${superkingdoms.join(', ')}"\n`;
      filename = `cluster_${clusterId}_taxonomy_overview.csv`;
    }
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy Distribution</CardTitle>
          <CardDescription>Loading taxonomy data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay 
            error={error} 
            onRetry={onRefresh}
          />
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!taxonomyStats.length && !speciesDistribution.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy Distribution</CardTitle>
          <CardDescription>No taxonomy data available</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center">
          <Info className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 mb-4">No taxonomy data available for this cluster</p>
          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Refresh Data</span>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Sub-tabs for different taxonomy views */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Taxonomy Distribution</CardTitle>
            <CardDescription>Explore the taxonomic diversity of this cluster</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleExportCsv}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeSubtab} onValueChange={setActiveSubtab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phyla">Phyla Distribution</TabsTrigger>
              <TabsTrigger value="species">Species Distribution</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Taxonomic Metrics</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Taxonomic Diversity</TableCell>
                          <TableCell>
                            <Badge className={
                              !taxonomicDiversity ? 'bg-gray-300' :
                              taxonomicDiversity >= 0.7 ? 'bg-green-500' :
                              taxonomicDiversity >= 0.4 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }>
                              {formatPercentage(taxonomicDiversity)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Distinct Phyla</TableCell>
                          <TableCell>{distinctPhyla}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Distinct Families</TableCell>
                          <TableCell>{distinctFamilies}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Superkingdoms</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {superkingdoms.map((kingdom, i) => (
                                <Badge key={i} className="bg-green-500">{kingdom}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Interpretation</h3>
                    <div className="bg-blue-50 p-4 rounded-md text-sm">
                      <p className="mb-2">
                        {taxonomicDiversity >= 0.7 
                          ? "This cluster shows high taxonomic diversity, suggesting this domain is evolutionarily conserved across multiple phyla."
                          : taxonomicDiversity >= 0.4 
                          ? "This cluster shows moderate taxonomic diversity, with representation across multiple taxonomic groups."
                          : "This cluster shows relatively low taxonomic diversity, suggesting the domain may be specialized to certain taxonomic groups."}
                      </p>
                      <p>
                        The distribution spans {distinctPhyla} distinct phyla and {distinctFamilies} distinct families,
                        covering {superkingdoms.length} superkingdom{superkingdoms.length !== 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Distribution Overview</h3>
                  <div className="h-80 border rounded-md p-4 bg-gray-50">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taxonomyStats.slice(0, 5)} // Show top 5 phyla
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="phylum"
                          label={({ phylum, percent }) => 
                            `${phylum.length > 15 ? phylum.substring(0, 15) + '...' : phylum} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {taxonomyStats.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} domains`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Phyla Distribution Tab */}
            <TabsContent value="phyla">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Phylum Distribution</h3>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-80 border rounded-md p-4 bg-gray-50">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={taxonomyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="phylum" />
                        <YAxis />
                        <Tooltip formatter={(value, name, props) => [`${value} domains`, props.payload.phylum]} />
                        <Legend />
                        <Bar dataKey="count" name="Domain Count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taxonomyStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="phylum"
                          label={({ phylum, percent }) => 
                            `${phylum.length > 15 ? phylum.substring(0, 15) + '...' : phylum} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {taxonomyStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} domains`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Phyla Table</h3>
                  <div className="max-h-64 overflow-y-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phylum</TableHead>
                          <TableHead className="text-right">Domain Count</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {taxonomyStats.map((item, index) => {
                          const totalCount = taxonomyStats.reduce((sum, item) => sum + item.count, 0);
                          const percentage = (item.count / totalCount * 100).toFixed(1);
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.phylum}</TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                              <TableCell className="text-right">{percentage}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Species Distribution Tab */}
            <TabsContent value="species">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Species Distribution</h3>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-80 border rounded-md p-4 bg-gray-50">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={speciesDistribution.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="species" />
                        <YAxis />
                        <Tooltip formatter={(value, name, props) => [`${value} domains`, props.payload.species]} />
                        <Legend />
                        <Bar dataKey="count" name="Domain Count" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={speciesDistribution.slice(0, 10)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="species"
                          label={({ species, percent }) => 
                            `${species.length > 12 ? species.substring(0, 10) + '...' : species} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {speciesDistribution.slice(0, 10).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} domains`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Species Table</h3>
                  <div className="max-h-64 overflow-y-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Species</TableHead>
                          <TableHead className="text-right">Domain Count</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {speciesDistribution.map((item, index) => {
                          const totalCount = speciesDistribution.reduce((sum, item) => sum + item.count, 0);
                          const percentage = (item.count / totalCount * 100).toFixed(1);
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.species}</TableCell>
                              <TableCell className="text-right">{item.count}</TableCell>
                              <TableCell className="text-right">{percentage}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxonomyTab;