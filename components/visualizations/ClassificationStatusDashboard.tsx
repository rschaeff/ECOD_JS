import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';
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

// Mock data for the new visualization
const mockPhyleticData = [
  { name: 'Monophyletic', count: 3842, percentage: 58.2 },
  { name: 'Multi-phyletic', count: 1653, percentage: 25.0 },
  { name: 'Singleton', count: 1108, percentage: 16.8 }
];

// More detailed mock data for the breakdown
const mockPhyleticBreakdown = {
  monophyletic: [
    { phylum: 'Proteobacteria', count: 1245, percentage: 32.4 },
    { phylum: 'Firmicutes', count: 875, percentage: 22.8 },
    { phylum: 'Chordata', count: 720, percentage: 18.7 },
    { phylum: 'Arthropoda', count: 480, percentage: 12.5 },
    { phylum: 'Other', count: 522, percentage: 13.6 }
  ],
  multiPhyletic: [
    { combination: 'Bacteria + Eukaryota', count: 876, percentage: 53.0 },
    { combination: 'Bacteria + Archaea', count: 312, percentage: 18.9 },
    { combination: 'All kingdoms', count: 254, percentage: 15.4 },
    { combination: 'Eukaryota + Archaea', count: 211, percentage: 12.7 }
  ]
};

// Mock data for the improved structural groups tab
const mockStructuralConsistencyData = [
  { name: 'Single T-Group', count: 4256, percentage: 64.5 },
  { name: 'Multiple T-Groups', count: 1542, percentage: 23.4 },
  { name: 'Multiple H-Groups', count: 580, percentage: 8.8 },
  { name: 'Multiple X-Groups', count: 225, percentage: 3.3 }
];

// Mock data for T-group distribution
const mockTGroupDistribution = [
  { tgroup: 'Alpha/Beta Hydrolases', consistentCount: 842, mixedCount: 132 },
  { tgroup: 'Immunoglobulin-like', consistentCount: 756, mixedCount: 253 },
  { tgroup: 'Rossmann Fold', consistentCount: 625, mixedCount: 321 },
  { tgroup: 'TIM Barrels', consistentCount: 587, mixedCount: 98 },
  { tgroup: 'Beta Propellers', consistentCount: 419, mixedCount: 86 },
  { tgroup: 'Other', consistentCount: 1027, mixedCount: 652 }
];

// Mock data for H-group patterns
const mockHGroupDistribution = [
  { pattern: 'Same H-Group', count: 4256, percentage: 64.5 },
  { pattern: 'Related H-Groups', count: 1542, percentage: 23.4 },
  { pattern: 'Distant H-Groups', count: 580, percentage: 8.8 },
  { pattern: 'Unrelated H-Groups', count: 225, percentage: 3.3 }
];

const mockClassificationData = [
  { status: 'Validated', count: 4235 },
  { status: 'Needs Review', count: 1458 },
  { status: 'Conflicting', count: 752 },
  { status: 'Unclassified', count: 158 }
];

// Mock data for confidence levels
const mockConfidenceLevels = [
  { level: 'High Confidence', count: 3842, percentage: 58.2 },
  { level: 'Medium Confidence', count: 1625, percentage: 24.6 },
  { level: 'Low Confidence', count: 872, percentage: 13.2 },
  { level: 'Uncertain', count: 264, percentage: 4.0 }
];

// Mock data for classification timeline
const mockClassificationTimeline = [
  { period: 'Oct-Dec 2024', newClassifications: 1245, reclassifications: 326 },
  { period: 'Jul-Sep 2024', newClassifications: 897, reclassifications: 278 },
  { period: 'Apr-Jun 2024', newClassifications: 1432, reclassifications: 412 },
  { period: 'Jan-Mar 2024', newClassifications: 862, reclassifications: 187 },
  { period: 'Oct-Dec 2023', newClassifications: 745, reclassifications: 203 }
];

const ClassificationStatusDashboard = () => {
  const [activeTab, setActiveTab] = useState('phyletic');
  const [selectedClusterSet, setSelectedClusterSet] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [phyleticView, setPhyleticView] = useState('overview'); // 'overview', 'mono', 'multi'
  const [selectedStructuralView, setSelectedStructuralView] = useState('overview'); // 'overview', 'tgroup-detail', 'hgroup-detail'
  const [selectedClassificationView, setSelectedClassificationView] = useState('status'); // 'status', 'confidence', 'timeline'
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const PHYLETIC_COLORS = {
    'Monophyletic': '#0088FE', // Blue
    'Multi-phyletic': '#FF8042', // Orange
    'Singleton': '#00C49F'     // Green
  };
  const STRUCTURAL_COLORS = {
    'Single T-Group': '#0088FE',      // Blue
    'Multiple T-Groups': '#FFBB28',   // Yellow
    'Multiple H-Groups': '#FF8042',   // Orange
    'Multiple X-Groups': '#d32f2f'    // Red
  };
  const STATUS_COLORS = {
    'Validated': '#00C49F',
    'Needs Review': '#FFBB28',
    'Conflicting': '#FF8042',
    'Unclassified': '#8884d8'
  };
  const CONFIDENCE_COLORS = {
    'High Confidence': '#00C49F',    // Green
    'Medium Confidence': '#0088FE',  // Blue
    'Low Confidence': '#FFBB28',     // Yellow
    'Uncertain': '#FF8042'           // Orange
  };

  // Mock refresh function
  const refresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Classification Status Overview</CardTitle>
            <CardDescription>
              Distribution of clusters by phyletic pattern and structural groups
            </CardDescription>
          </div>
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
                <SelectItem value="90">SwissProt-90</SelectItem>
                <SelectItem value="70">SwissProt-70</SelectItem>
                <SelectItem value="50">SwissProt-50</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refresh}
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phyletic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="phyletic">Phyletic Distribution</TabsTrigger>
            <TabsTrigger value="structural">Structural Groups</TabsTrigger>
            <TabsTrigger value="classification">Classification Status</TabsTrigger>
          </TabsList>
          
          {/* New Phyletic Distribution Tab */}
          <TabsContent value="phyletic">
            <div className="mb-3 flex justify-between items-center">
              <div className="text-sm font-medium">
                {phyleticView === 'overview' ? 
                  'Overview of cluster distribution by phyletic pattern' : 
                  phyleticView === 'mono' ? 
                  'Breakdown of monophyletic clusters by phylum' : 
                  'Breakdown of multi-phyletic clusters by kingdom combinations'}
              </div>
              <div>
                <Select 
                  value={phyleticView} 
                  onValueChange={setPhyleticView}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="mono">Monophyletic Breakdown</SelectItem>
                    <SelectItem value="multi">Multi-phyletic Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="h-80">
              {phyleticView === 'overview' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPhyleticData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        name === 'count' ? value.toLocaleString() : `${value}%`,
                        name === 'count' ? 'Clusters' : 'Percentage'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      name="Clusters" 
                      fill="#8884d8"
                      animationDuration={1000}
                    >
                      {mockPhyleticData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PHYLETIC_COLORS[entry.name] || '#8884d8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : phyleticView === 'mono' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPhyleticBreakdown.monophyletic}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="phylum"
                      label={({ phylum, percentage }) => 
                        `${phylum} (${percentage}%)`
                      }
                      animationDuration={1000}
                    >
                      {mockPhyleticBreakdown.monophyletic.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label 
                        value="Monophyletic Clusters" 
                        position="center"
                        style={{ fontSize: '14px', fill: '#666' }}
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPhyleticBreakdown.multiPhyletic}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="combination"
                      label={({ combination, percentage }) => 
                        `${combination} (${percentage}%)`
                      }
                      animationDuration={1000}
                    >
                      {mockPhyleticBreakdown.multiPhyletic.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label 
                        value="Multi-phyletic Clusters" 
                        position="center"
                        style={{ fontSize: '14px', fill: '#666' }}
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Understanding Phyletic Patterns</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">Monophyletic clusters:</span> All members belong to the same phylum, indicating potential functional conservation within lineage</li>
                    <li><span className="font-medium">Multi-phyletic clusters:</span> Members span multiple phyla, suggesting widespread functional importance or convergent evolution</li>
                    <li><span className="font-medium">Singleton clusters:</span> Clusters with only one member, potentially representing specialized functions or insufficient data</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Improved Structural Groups Tab */}
          <TabsContent value="structural">
            <div className="mb-3 flex justify-between items-center">
              <div className="text-sm font-medium">
                Distribution of clusters by structural group consistency
              </div>
              <div>
                <Select 
                  value={selectedStructuralView} 
                  onValueChange={setSelectedStructuralView}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="tgroup-detail">T-Group Details</SelectItem>
                    <SelectItem value="hgroup-detail">H-Group Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="h-80">
              {selectedStructuralView === 'overview' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStructuralConsistencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Clusters" 
                      fill="#8884d8" 
                      animationDuration={1000}
                    >
                      {mockStructuralConsistencyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STRUCTURAL_COLORS[entry.name] || '#8884d8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : selectedStructuralView === 'tgroup-detail' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTGroupDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="tgroup" type="category" width={150} />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="consistentCount" 
                      name="Single T-Group" 
                      stackId="a" 
                      fill="#0088FE" 
                      animationDuration={1000} 
                    />
                    <Bar 
                      dataKey="mixedCount" 
                      name="Multi T-Group" 
                      stackId="a" 
                      fill="#FFBB28" 
                      animationDuration={1000} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockHGroupDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="pattern"
                      label={({ pattern, percentage }) => 
                        `${pattern} (${percentage}%)`
                      }
                      animationDuration={1000}
                    >
                      {mockHGroupDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label 
                        value="H-Group Consistency" 
                        position="center"
                        style={{ fontSize: '14px', fill: '#666' }}
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Understanding Structural Consistency</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">Single T-Group:</span> All members belong to the same topology group, indicating consistent structural classification</li>
                    <li><span className="font-medium">Multiple T-Groups:</span> Members span different topology groups, suggesting potential structural variation</li>
                    <li><span className="font-medium">Multiple H-Groups:</span> Members span different homology groups within the same topology, indicating potential distant relationships</li>
                    <li><span className="font-medium">Multiple X-Groups:</span> Members span even broader structural categories, suggesting potential misclassification</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Improved Classification Status Tab */}
          <TabsContent value="classification">
            <div className="mb-3 flex justify-between items-center">
              <div className="text-sm font-medium">
                Distribution of clusters by classification status and confidence
              </div>
              <div>
                <Select 
                  value={selectedClassificationView} 
                  onValueChange={setSelectedClassificationView}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status Distribution</SelectItem>
                    <SelectItem value="confidence">Confidence Levels</SelectItem>
                    <SelectItem value="timeline">Classification Timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="h-80">
              {selectedClassificationView === 'status' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockClassificationData}>
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
                    >
                      {mockClassificationData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || '#8884d8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : selectedClassificationView === 'confidence' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockConfidenceLevels}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="level"
                      label={({ level, percentage }) => 
                        `${level} (${percentage}%)`
                      }
                      animationDuration={1000}
                    >
                      {mockConfidenceLevels.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CONFIDENCE_COLORS[entry.level] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                      <Label 
                        value="Classification Confidence" 
                        position="center"
                        style={{ fontSize: '14px', fill: '#666' }}
                      />
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        'Clusters'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockClassificationTimeline} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="period" type="category" width={120} />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value.toLocaleString(),
                        name
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="newClassifications" 
                      name="Newly Classified" 
                      stackId="a" 
                      fill="#0088FE" 
                      animationDuration={1000} 
                    />
                    <Bar 
                      dataKey="reclassifications" 
                      name="Reclassified" 
                      stackId="a" 
                      fill="#FF8042" 
                      animationDuration={1000} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Understanding Classification Status</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="font-medium">Validated:</span> Clusters with high structural consistency and strong evidence for classification</li>
                    <li><span className="font-medium">Needs Review:</span> Clusters that may represent novel folds or domains requiring manual curation</li>
                    <li><span className="font-medium">Conflicting:</span> Clusters with inconsistent structural or functional evidence</li>
                    <li><span className="font-medium">Unclassified:</span> Clusters that haven't been assigned to a specific structural group</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Summary statistics below the charts - now responsive to active tab */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
          {activeTab === 'phyletic' ? (
            <>
              <div>
                <p className="text-sm text-gray-500">Total Clusters</p>
                <p className="text-xl font-semibold">6,603</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monophyletic Rate</p>
                <p className="text-xl font-semibold">58.2%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Multi-phyletic Rate</p>
                <p className="text-xl font-semibold">25.0%</p>
              </div>
            </>
          ) : activeTab === 'structural' ? (
            <>
              <div>
                <p className="text-sm text-gray-500">Single T-Group Rate</p>
                <p className="text-xl font-semibold">64.5%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Consistent H-Group Rate</p>
                <p className="text-xl font-semibold">87.9%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Structural Anomalies</p>
                <p className="text-xl font-semibold">3.3%</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500">Classification Rate</p>
                <p className="text-xl font-semibold">97.6%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">High Confidence</p>
                <p className="text-xl font-semibold">58.2%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Need Review</p>
                <p className="text-xl font-semibold">22.1%</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassificationStatusDashboard;