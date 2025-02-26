import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Label,
  LineChart,
  Line,
  Brush
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const DomainQualityDistribution = () => {
  const [selectedJudge, setSelectedJudge] = useState('all');
  
  // Mock data for visualization
  const mockData = {
    // Domain confidence distribution
    confidenceDistribution: [
      { category: 'Very High (>90)', count: 5823, percentage: 0.38 },
      { category: 'High (70-90)', count: 6241, percentage: 0.41 },
      { category: 'Medium (50-70)', count: 2432, percentage: 0.16 },
      { category: 'Low (<50)', count: 754, percentage: 0.05 }
    ],
    
    // DPAM judge distribution
    dpamJudgeDistribution: [
      { judge: 'Very confident', count: 8213, percentage: 0.54 },
      { judge: 'Confident', count: 4126, percentage: 0.27 },
      { judge: 'Uncertain', count: 2156, percentage: 0.14 },
      { judge: 'Unreliable', count: 755, percentage: 0.05 }
    ],
    
    // Domain vs protein confidence (scatter plot data)
    correlationData: Array.from({ length: 150 }, () => {
      const proteinPLDDT = Math.random() * 40 + 60; // 60-100 range
      const domainConfidence = proteinPLDDT * (Math.random() * 0.3 + 0.7); // Some correlation but with variance
      
      let judge;
      if (domainConfidence > 90) judge = 'Very confident';
      else if (domainConfidence > 75) judge = 'Confident';
      else if (domainConfidence > 50) judge = 'Uncertain';
      else judge = 'Unreliable';
      
      return {
        proteinPLDDT,
        domainConfidence,
        judge
      };
    }),
    
    // Confidence by DPAM judge
    confidenceByJudge: [
      { judge: 'Very confident', min: 78, q1: 88, median: 93, q3: 97, max: 100 },
      { judge: 'Confident', min: 60, q1: 70, median: 82, q3: 88, max: 95 },
      { judge: 'Uncertain', min: 45, q1: 55, median: 65, q3: 72, max: 85 },
      { judge: 'Unreliable', min: 20, q1: 35, median: 45, q3: 52, max: 65 }
    ],
    
    // Distribution of DPAM prob
    dpamProbDistribution: [
      { range: '0.0-0.1', count: 120 },
      { range: '0.1-0.2', count: 235 },
      { range: '0.2-0.3', count: 402 },
      { range: '0.3-0.4', count: 587 },
      { range: '0.4-0.5', count: 803 },
      { range: '0.5-0.6', count: 1245 },
      { range: '0.6-0.7', count: 1876 },
      { range: '0.7-0.8', count: 2543 },
      { range: '0.8-0.9', count: 3687 },
      { range: '0.9-1.0', count: 4752 }
    ],
    
    // DPAM confidence distribution by judge over score ranges
    dpamConfidenceByJudge: [
      { probRange: '0.0-0.2', veryConfident: 0, confident: 12, uncertain: 125, unreliable: 218 },
      { probRange: '0.2-0.4', veryConfident: 18, confident: 145, uncertain: 427, unreliable: 399 },
      { probRange: '0.4-0.6', veryConfident: 154, confident: 742, uncertain: 895, unreliable: 138 },
      { probRange: '0.6-0.8', veryConfident: 1834, confident: 2012, uncertain: 573, unreliable: 0 },
      { probRange: '0.8-1.0', veryConfident: 6207, confident: 1215, uncertain: 17, unreliable: 0 }
    ],
    
    // Quality over time data
    qualityOverTime: [
      { month: 'Sep 2024', averagePLDDT: 77.3, countPredicted: 2450, countExperimental: 380 },
      { month: 'Oct 2024', averagePLDDT: 78.1, countPredicted: 2780, countExperimental: 410 },
      { month: 'Nov 2024', averagePLDDT: 77.9, countPredicted: 2650, countExperimental: 390 },
      { month: 'Dec 2024', averagePLDDT: 78.5, countPredicted: 2830, countExperimental: 420 },
      { month: 'Jan 2025', averagePLDDT: 79.2, countPredicted: 3150, countExperimental: 450 },
      { month: 'Feb 2025', averagePLDDT: 80.1, countPredicted: 3480, countExperimental: 520 }
    ],
    
    // Summary metrics
    metrics: {
      totalDomains: 15250,
      avgDomainPLDDT: 78.4,
      avgProteinPLDDT: 82.6,
      highConfidenceFraction: 0.79,
      correlationCoefficient: 0.78,
      structuresWithDomains: 8940,
      totalStructures: 12450
    }
  };

  // Colors for different categories
  const COLORS = {
    'Very High (>90)': '#00A36A',
    'High (70-90)': '#00C49F', 
    'Medium (50-70)': '#FFBB28', 
    'Low (<50)': '#FF6B6B',
    'Very confident': '#00A36A',
    'Confident': '#00C49F',
    'Uncertain': '#FFBB28',
    'Unreliable': '#FF6B6B'
  };
  
  // Format percentage
  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;
  
  // Function to map judge to color
  const getJudgeColor = (judge) => {
    return COLORS[judge] || '#8884d8';
  };
  
  // Function to get status badge
  const getJudgeBadge = (judge) => {
    const colorMap = {
      'Very confident': 'bg-emerald-500',
      'Confident': 'bg-green-500',
      'Uncertain': 'bg-yellow-500',
      'Unreliable': 'bg-red-500'
    };
    
    return (
      <Badge className={colorMap[judge] || 'bg-gray-500'}>
        {judge}
      </Badge>
    );
  };
  
  // Filter data based on selected judge
  const filterByJudge = (data) => {
    if (selectedJudge === 'all') return data;
    return data.filter(item => item.judge === selectedJudge);
  };
  
  // Generate custom tooltip for DPAM confidence chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium">{`DPAM Probability: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} domains`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Domain Quality Distribution</CardTitle>
            <CardDescription>Analysis of AlphaFold domain quality metrics</CardDescription>
          </div>
          <Select 
            value={selectedJudge} 
            onValueChange={setSelectedJudge}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by DPAM judge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Very confident">Very confident</SelectItem>
              <SelectItem value="Confident">Confident</SelectItem>
              <SelectItem value="Uncertain">Uncertain</SelectItem>
              <SelectItem value="Unreliable">Unreliable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="confidence">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="confidence">Confidence Distribution</TabsTrigger>
            <TabsTrigger value="correlation">Domain vs Protein</TabsTrigger>
            <TabsTrigger value="dpam">DPAM Analysis</TabsTrigger>
          </TabsList>
          
          {/* Confidence Distribution Tab */}
          <TabsContent value="confidence" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key metrics */}
              <div className="col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">High Confidence Domains</h3>
                  <div className="text-3xl font-bold">{formatPercentage(mockData.metrics.highConfidenceFraction)}</div>
                  <p className="text-xs text-gray-500 mt-1">Domains with confidence >70%</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Average Domain pLDDT</h3>
                  <div className="text-3xl font-bold">{mockData.metrics.avgDomainPLDDT.toFixed(1)}</div>
                  <p className="text-xs text-gray-500 mt-1">Mean confidence across all domains</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Domains</h3>
                  <div className="text-3xl font-bold">{mockData.metrics.totalDomains.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 mt-1">AlphaFold predicted domains</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">DPAM Judge Distribution</h3>
                  <div className="mt-2 space-y-2">
                    {mockData.dpamJudgeDistribution.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getJudgeColor(item.judge) }}
                          ></div>
                          <span className="text-sm">{item.judge}</span>
                        </div>
                        <span className="text-sm font-medium">{formatPercentage(item.percentage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Confidence pie chart */}
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Confidence Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockData.confidenceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                        label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {mockData.confidenceDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.category] || '#8884d8'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Domains']} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* DPAM prob distribution */}
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Probability Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.dpamProbDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Domains']} />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8" 
                        radius={[4, 4, 0, 0]}
                      >
                        {mockData.dpamProbDistribution.map((entry, index) => {
                          // Gradient color based on probability
                          const value = index / 9; // 0 to 1
                          const r = Math.round(255 * (1 - value));
                          const g = Math.round(165 * value);
                          const b = Math.round(255 * (1 - value) * 0.3);
                          return <Cell key={`cell-${index}`} fill={`rgb(${r}, ${g}, ${b})`} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Correlation Tab */}
          <TabsContent value="correlation" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scatter plot of correlation */}
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Domain Confidence vs Protein pLDDT</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="proteinPLDDT" 
                        name="Protein pLDDT" 
                        domain={[40, 100]}
                      >
                        <Label value="Protein pLDDT Score" offset={0} position="bottom" />
                      </XAxis>
                      <YAxis 
                        type="number" 
                        dataKey="domainConfidence" 
                        name="Domain DPAM Confidence" 
                        domain={[40, 100]}
                      >
                        <Label value="Domain DPAM Confidence" angle={-90} position="left" />
                      </YAxis>
                      <ZAxis range={[60, 60]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name) => [value.toFixed(2), name]}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-sm">
                                <p className="font-medium">Domain Details</p>
                                <p>Protein pLDDT: {data.proteinPLDDT.toFixed(1)}</p>
                                <p>Domain Confidence: {data.domainConfidence.toFixed(1)}</p>
                                <p>DPAM Judge: {data.judge}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {['Very confident', 'Confident', 'Uncertain', 'Unreliable'].map((judge) => {
                        const filteredData = filterByJudge(mockData.correlationData).filter(d => d.judge === judge);
                        return filteredData.length > 0 ? (
                          <Scatter
                            key={judge}
                            name={judge}
                            data={filteredData}
                            fill={getJudgeColor(judge)}
                          />
                        ) : null;
                      })}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-sm mt-2">
                  <span className="font-medium">Correlation: </span>
                  <span>{mockData.metrics.correlationCoefficient.toFixed(2)}</span>
                  <span className="mx-3">|</span>
                  <span className="font-medium">Mean Protein pLDDT: </span>
                  <span>{mockData.metrics.avgProteinPLDDT.toFixed(1)}</span>
                  <span className="mx-3">|</span>
                  <span className="font-medium">Mean Domain Confidence: </span>
                  <span>{mockData.metrics.avgDomainPLDDT.toFixed(1)}</span>
                </div>
              </div>
              
              {/* Box plot - Confidence by judge */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Confidence Range by DPAM Judge</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mockData.confidenceByJudge}
                      layout="vertical"
                      margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis 
                        dataKey="judge" 
                        type="category" 
                        scale="band"
                        tick={{ fill: '#666' }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-sm">
                                <p className="font-medium">{data.judge}</p>
                                <p>Min: {data.min}</p>
                                <p>Q1: {data.q1}</p>
                                <p>Median: {data.median}</p>
                                <p>Q3: {data.q3}</p>
                                <p>Max: {data.max}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="median" fill="transparent">
                        {mockData.confidenceByJudge.map((entry, index) => {
                          const color = getJudgeColor(entry.judge);
                          return (
                            <Cell key={`cell-box-${index}`}>
                              {/* Render a custom box plot for each entry */}
                              <g>
                                {/* Whiskers */}
                                <line 
                                  x1={entry.min} y1={15} 
                                  x2={entry.min} y2={25} 
                                  stroke={color} 
                                  strokeWidth={2} 
                                />
                                <line 
                                  x1={entry.max} y1={15} 
                                  x2={entry.max} y2={25} 
                                  stroke={color} 
                                  strokeWidth={2} 
                                />
                                <line 
                                  x1={entry.min} y1={20} 
                                  x2={entry.q1} y2={20} 
                                  stroke={color} 
                                  strokeWidth={2} 
                                />
                                <line 
                                  x1={entry.q3} y1={20} 
                                  x2={entry.max} y2={20} 
                                  stroke={color} 
                                  strokeWidth={2} 
                                />
                                
                                {/* Box */}
                                <rect 
                                  x={entry.q1} 
                                  y={10} 
                                  width={entry.q3 - entry.q1} 
                                  height={20} 
                                  fill={color} 
                                  stroke={color}
                                  opacity={0.6}
                                />
                                
                                {/* Median */}
                                <line 
                                  x1={entry.median} y1={10} 
                                  x2={entry.median} y2={30} 
                                  stroke="#fff" 
                                  strokeWidth={2} 
                                />
                              </g>
                            </Cell>
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Line chart showing domain vs protein quality correlation */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Quality Relationship Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 21 }, (_, i) => {
                        const proteinQuality = 50 + i * 2.5;
                        // Simulated relationship with some noise
                        const baseQuality = proteinQuality * 0.9 + Math.random() * 5;
                        return {
                          proteinQuality,
                          averageDomainQuality: baseQuality > proteinQuality ? proteinQuality : baseQuality,
                          upperBound: Math.min(100, baseQuality + 10),
                          lowerBound: Math.max(0, baseQuality - 15)
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="proteinQuality" 
                        label={{ value: 'Protein pLDDT', position: 'bottom', offset: 0 }} 
                      />
                      <YAxis domain={[0, 100]} label={{ value: 'Domain Confidence', angle: -90, position: 'left' }} />
                      <Tooltip formatter={(value) => [value.toFixed(1), '']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="averageDomainQuality" 
                        name="Avg Domain Confidence" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="upperBound" 
                        name="Upper Range" 
                        stroke="#82ca9d" 
                        strokeDasharray="5 5" 
                        strokeWidth={1}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lowerBound" 
                        name="Lower Range" 
                        stroke="#ffc658" 
                        strokeDasharray="5 5" 
                        strokeWidth={1}
                      />
                      <Brush dataKey="proteinQuality" height={30} stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* DPAM Analysis Tab */}
          <TabsContent value="dpam" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DPAM judge distribution */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Judge Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockData.dpamJudgeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="judge"
                        label={({ judge, percent }) => `${judge} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {mockData.dpamJudgeDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getJudgeColor(entry.judge)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value.toLocaleString(), 'Domains']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* DPAM Judge by confidence range (stacked bar) */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Judge by Confidence Range</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.dpamConfidenceByJudge}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="probRange" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar 
                        dataKey="veryConfident" 
                        name="Very confident" 
                        stackId="a" 
                        fill={getJudgeColor('Very confident')} 
                      />
                      <Bar 
                        dataKey="confident" 
                        name="Confident" 
                        stackId="a" 
                        fill={getJudgeColor('Confident')} 
                      />
                      <Bar 
                        dataKey="uncertain" 
                        name="Uncertain" 
                        stackId="a" 
                        fill={getJudgeColor('Uncertain')} 
                      />
                      <Bar 
                        dataKey="unreliable" 
                        name="Unreliable" 
                        stackId="a" 
                        fill={getJudgeColor('Unreliable')} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* DPAM Judge Details Table */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Judge Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Judge Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain Count
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. DPAM Prob
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. pLDDT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockData.dpamJudgeDistribution.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-4 w-4 rounded-full" style={{ backgroundColor: getJudgeColor(item.judge) }}></div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.judge}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {formatPercentage(item.percentage)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.judge === 'Very confident' ? '0.87' : 
                             item.judge === 'Confident' ? '0.72' : 
                             item.judge === 'Uncertain' ? '0.53' : 
                             '0.34'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.judge === 'Very confident' ? '92.4' : 
                             item.judge === 'Confident' ? '81.7' : 
                             item.judge === 'Uncertain' ? '63.5' : 
                             '48.2'}
                          </td>
                        </tr>
                      ))}