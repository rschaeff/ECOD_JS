import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useStructureQualityData } from '@/hooks/useStructureQuality';

interface StructureQualityVisualizationProps {
  className?: string;
}

const StructureQualityVisualization: React.FC<StructureQualityVisualizationProps> = ({
  className
}) => {
  const { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    filterBySource,
    selectedSource
  } = useStructureQualityData();
  
  const [activeTab, setActiveTab] = useState('distribution');

  // Colors for different quality categories
  const QUALITY_COLORS = {
    'Very high': '#00A36A', // Dark Green
    'High': '#00C49F',      // Green
    'Medium': '#FFBB28',    // Yellow
    'Low': '#FF8042',       // Orange
    'Very low': '#FF6B6B',  // Red
    
    // Source colors
    'AlphaFold': '#0088FE',
    'Experimental': '#00C49F',
    'ESMFold': '#FFBB28',
    'Other': '#FF8042'
  };

  // Format percentage
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Generate gradient ID for each quality category (for bar charts)
  const getGradientId = (category: string) => {
    return `color-${category.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Quality level badge
  const getQualityBadge = (category: string) => {
    const colorMap: Record<string, string> = {
      'Very high': 'bg-emerald-500',
      'High': 'bg-green-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-orange-500',
      'Very low': 'bg-red-500'
    };
    
    return (
      <Badge className={colorMap[category] || 'bg-gray-500'}>
        {category}
      </Badge>
    );
  };

  return (
    <Card className={className} data-testid="structure-quality-visualization">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Structure Quality Analysis</CardTitle>
            <CardDescription>
              Quality distribution of protein structures in the database
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedSource || 'all'} 
              onValueChange={(value) => filterBySource(value === 'all' ? null : value)}
              disabled={loading || refreshing}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="AlphaFold">AlphaFold</SelectItem>
                <SelectItem value="Experimental">Experimental</SelectItem>
                <SelectItem value="ESMFold">ESMFold</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refresh}
              disabled={refreshing || loading}
              data-testid="refresh-structure-quality-btn"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          // Loading skeleton
          <div className="space-y-4" data-testid="structure-quality-loading">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="p-4 bg-red-50 rounded-md text-red-700" data-testid="structure-quality-error">
            <AlertTriangle className="h-5 w-5 mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? 'Trying again...' : 'Try Again'}
            </Button>
          </div>
        ) : (
          // Content with tabs
          <div data-testid="structure-quality-content">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="distribution">Quality Distribution</TabsTrigger>
                <TabsTrigger value="sources">Structure Sources</TabsTrigger>
                <TabsTrigger value="trends">Quality Trends</TabsTrigger>
              </TabsList>
              
              {/* Quality Distribution Tab */}
              <TabsContent value="distribution" className="mt-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.qualityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="category"
                            label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {data?.qualityDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={QUALITY_COLORS[entry.category as keyof typeof QUALITY_COLORS] || '#8884d8'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value.toLocaleString()} structures`, name]}
                          />
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Quality Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-gray-500">Average pLDDT</div>
                        <div className="text-xl font-semibold">
                          {data?.metrics.averagePLDDT.toFixed(1)}
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-gray-500">Average Resolution</div>
                        <div className="text-xl font-semibold">
                          {data?.metrics.averageResolution.toFixed(2)}Å
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-gray-500">High Quality</div>
                        <div className="text-xl font-semibold">
                          {formatPercentage(data?.metrics.percentageHighQuality || 0)}
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm text-gray-500">Experimental</div>
                        <div className="text-xl font-semibold">
                          {formatPercentage(data?.metrics.percentageExperimental || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Detailed distributions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">pLDDT Score Distribution</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.pLDDTDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} structures`, 'Count']} />
                          <defs>
                            {data?.pLDDTDistribution.map((entry, index) => {
                              // Define gradient colors based on range
                              let color;
                              switch (entry.range) {
                                case '90-100': color = QUALITY_COLORS['Very high']; break;
                                case '70-90': color = QUALITY_COLORS['High']; break;
                                case '50-70': color = QUALITY_COLORS['Medium']; break;
                                default: color = QUALITY_COLORS['Low'];
                              }
                              
                              return (
                                <linearGradient 
                                  key={`gradient-${index}`}
                                  id={`gradient-plddt-${index}`} 
                                  x1="0" y1="0" x2="0" y2="1"
                                >
                                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0.4}/>
                                </linearGradient>
                              );
                            })}
                          </defs>
                          <Bar 
                            dataKey="count" 
                            name="Structures"
                          >
                            {data?.pLDDTDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#gradient-plddt-${index})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution Distribution</h4>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.resolutionDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} structures`, 'Count']} />
                          <defs>
                            {data?.resolutionDistribution.map((entry, index) => {
                              // Define gradient colors based on range
                              let color;
                              switch (entry.range) {
                                case '<2.0Å': color = QUALITY_COLORS['Very high']; break;
                                case '2.0-2.5Å': color = QUALITY_COLORS['High']; break;
                                case '2.5-3.0Å': color = QUALITY_COLORS['Medium']; break;
                                case '3.0-3.5Å': color = QUALITY_COLORS['Low']; break;
                                default: color = QUALITY_COLORS['Very low'];
                              }
                              
                              return (
                                <linearGradient 
                                  key={`gradient-${index}`}
                                  id={`gradient-resolution-${index}`} 
                                  x1="0" y1="0" x2="0" y2="1"
                                >
                                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={color} stopOpacity={0.4}/>
                                </linearGradient>
                              );
                            })}
                          </defs>
                          <Bar 
                            dataKey="count" 
                            name="Structures"
                          >
                            {data?.resolutionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#gradient-resolution-${index})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Structure Sources Tab */}
              <TabsContent value="sources" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Structure Source Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.sourceDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="count"
                            nameKey="source"
                            label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {data?.sourceDistribution.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={QUALITY_COLORS[entry.source as keyof typeof QUALITY_COLORS] || '#8884d8'} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value.toLocaleString()} structures`, name]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Source Quality Comparison</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={data?.sourceDistribution.map(src => ({
                            source: src.source,
                            count: src.count,
                            highQuality: Math.round(src.count * (Math.random() * 0.3 + 0.6)), // Simulated data
                            mediumQuality: Math.round(src.count * (Math.random() * 0.2 + 0.1)), // Simulated data
                            lowQuality: Math.round(src.count * (Math.random() * 0.1)) // Simulated data
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="source" type="category" />
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} structures`, 'Count']} />
                          <Legend />
                          <Bar 
                            dataKey="highQuality" 
                            name="High Quality" 
                            stackId="a" 
                            fill={QUALITY_COLORS['High']} 
                          />
                          <Bar 
                            dataKey="mediumQuality" 
                            name="Medium Quality" 
                            stackId="a" 
                            fill={QUALITY_COLORS['Medium']} 
                          />
                          <Bar 
                            dataKey="lowQuality" 
                            name="Low Quality" 
                            stackId="a" 
                            fill={QUALITY_COLORS['Low']} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                
                  {/* Source details */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Source Details</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Quality</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data?.sourceDistribution.map((source, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {source.source}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {source.count.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {formatPercentage(source.percentage)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                {/* Simulated quality data */}
                                {getQualityBadge(
                                  source.source === 'Experimental' ? 'Very high' :
                                  source.source === 'AlphaFold' ? 'High' :
                                  'Medium'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Quality Trends Tab */}
              <TabsContent value="trends" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Average Quality Over Time</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.qualityOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" domain={[0, 100]} />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="averagePLDDT" 
                            name="Avg. pLDDT" 
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="countPredicted" 
                            name="Predicted Structures" 
                            stroke="#82ca9d" 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="countExperimental" 
                            name="Experimental Structures" 
                            stroke="#ffc658" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Structure Growth by Quality</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={
                            // Generate simulated data for visualization
                            Array.from({ length: 6 }, (_, i) => {
                              const month = ['Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025'][i];
                              const base = 1000 + i * 200;
                              return {
                                month,
                                'Very high': Math.round(base * 0.2),
                                'High': Math.round(base * 0.35),
                                'Medium': Math.round(base * 0.3),
                                'Low': Math.round(base * 0.1),
                                'Very low': Math.round(base * 0.05)
                              };
                            })
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="Very high" 
                            stackId="1" 
                            stroke={QUALITY_COLORS['Very high']} 
                            fill={QUALITY_COLORS['Very high']} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="High" 
                            stackId="1" 
                            stroke={QUALITY_COLORS['High']} 
                            fill={QUALITY_COLORS['High']} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Medium" 
                            stackId="1" 
                            stroke={QUALITY_COLORS['Medium']} 
                            fill={QUALITY_COLORS['Medium']} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Low" 
                            stackId="1" 
                            stroke={QUALITY_COLORS['Low']} 
                            fill={QUALITY_COLORS['Low']} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Very low" 
                            stackId="1" 
                            stroke={QUALITY_COLORS['Very low']} 
                            fill={QUALITY_COLORS['Very low']} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-xs text-gray-500">
          {data ? (
            <span>
              Total Structures: <strong>{data.metrics.totalStructures.toLocaleString()}</strong> • 
              With Domains: <strong>{data.metrics.structuresWithDomains.toLocaleString()}</strong> • 
              Last updated: <strong>{new Date().toLocaleDateString()}</strong>
            </span>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StructureQualityVisualization;