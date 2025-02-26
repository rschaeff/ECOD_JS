// /components/visualizations/ClassificationStatusDashboard.tsx

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Cell,
  Label
} from 'recharts';
import { useDashboardTaxonomy } from '@/hooks/useDashboardTaxonomy';

interface ClassificationStatusDashboardProps {
  selectedClusterSet: string;
  onClusterSetChange: (value: string) => void;
  className?: string;
}

const ClassificationStatusDashboard: React.FC<ClassificationStatusDashboardProps> = ({
  selectedClusterSet,
  onClusterSetChange,
  className
}) => {
  const { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    filterByClusterSet 
  } = useDashboardTaxonomy();
  
  const [activeTab, setActiveTab] = useState('taxonomic');
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Apply cluster set filter when displaying data
  const filteredData = React.useMemo(() => {
    if (!data) return null;
    return filterByClusterSet(selectedClusterSet);
  }, [data, selectedClusterSet, filterByClusterSet]);

  return (
    <Card className={className} data-testid="classification-status-dashboard">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Classification Status Overview</CardTitle>
            <CardDescription>
              Distribution of domains across taxonomy and structural groups
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedClusterSet} 
              onValueChange={onClusterSetChange}
              disabled={loading || refreshing}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select cluster set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cluster Sets</SelectItem>
                {data?.clusterSets.map(set => (
                  <SelectItem key={set.id} value={set.id.toString()}>
                    {set.name}
                  </SelectItem>
                )) || null }
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refresh}
              disabled={refreshing || loading}
              data-testid="refresh-taxonomy-btn"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading visualization data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-80 bg-red-50 rounded-md flex items-center justify-center p-4">
            <div className="flex flex-col items-center space-y-2 text-red-700">
              <AlertTriangle className="h-8 w-8" />
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refresh}
                disabled={refreshing}
              >
                {refreshing ? 'Trying again...' : 'Try Again'}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="taxonomic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="taxonomic">Taxonomic Distribution</TabsTrigger>
              <TabsTrigger value="structural">Structural Groups</TabsTrigger>
              <TabsTrigger value="classification">Classification Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="taxonomic">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData?.taxonomyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kingdom" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip 
                      formatter={(value, name) => [value.toLocaleString(), name]} 
                      labelFormatter={(label) => `Kingdom: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="domains" 
                      name="Domains" 
                      fill="#8884d8" 
                      animationDuration={1000}
                      isAnimationActive={!refreshing}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="clusters" 
                      name="Clusters" 
                      fill="#82ca9d" 
                      animationDuration={1000}
                      isAnimationActive={!refreshing}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="structural">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData?.tgroupDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="tgroup"
                      label={({ tgroup, percent }) => 
                        `${tgroup && tgroup.length > 15 ? tgroup.substring(0, 15) + '...' : tgroup} (${(percent ? percent * 100 : 0).toFixed(0)}%)`
                      }
                      animationDuration={1000}
                      isAnimationActive={!refreshing}
                    >
                      {filteredData?.tgroupDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label 
                        value="T-Group Distribution" 
                        position="center" 
                        className="text-lg font-medium"
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (!props || !props.payload) return [value, name];
                        return [`${value.toLocaleString()} clusters`, props.payload.tgroup];
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="classification">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredData?.classificationStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), 'Clusters']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Clusters" 
                      fill="#8884d8" 
                      animationDuration={1000}
                      isAnimationActive={!refreshing}
                    >
                      {filteredData?.classificationStats.map((entry, index) => {
                        // Color coding based on classification status
                        const statusColors = {
                          'Validated': '#00C49F',   // Green for validated
                          'Needs Review': '#FFBB28', // Yellow for needs review
                          'Conflicting': '#FF8042',  // Orange for conflicting
                          'Unclassified': '#8884d8'  // Purple for unclassified
                        };
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={statusColors[entry.status as keyof typeof statusColors] || '#8884d8'} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Optional: Summary statistics below the charts */}
        {!loading && !error && filteredData && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Total Clusters</p>
              <p className="text-xl font-semibold">
                {filteredData.totalClusters.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taxonomic Coverage</p>
              <p className="text-xl font-semibold">
                {(filteredData.taxonomicCoverage * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Classification Rate</p>
              <p className="text-xl font-semibold">
                {(filteredData.classifiedRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassificationStatusDashboard;