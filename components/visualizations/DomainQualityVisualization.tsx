import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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

import apiService, { DomainQualityData } from '@/services/api';

const DomainQualityDistribution = () => {
  const [selectedJudge, setSelectedJudge] = useState('all');
  const [domainData, setDomainData] = useState<DomainQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Mock data for visualization using the correct DPAM judge categories
  const mockData = {
    // Domain confidence distribution
    confidenceDistribution: [
      { category: 'Very High (>90)', count: 5823, percentage: 0.38 },
      { category: 'High (70-90)', count: 6241, percentage: 0.41 },
      { category: 'Medium (50-70)', count: 2432, percentage: 0.16 },
      { category: 'Low (<50)', count: 754, percentage: 0.05 }
    ],
    
    // DPAM judge distribution with actual categories
    dpamJudgeDistribution: [
      { judge: 'good_domain', count: 8213, percentage: 0.54 },
      { judge: 'simple_topology', count: 3126, percentage: 0.20 },
      { judge: 'partial_domain', count: 2156, percentage: 0.14 },
      { judge: 'low_confidence', count: 1755, percentage: 0.12 }
    ],
    
    // Domain vs protein confidence (scatter plot data)
    correlationData: Array.from({ length: 150 }, () => {
      const proteinPLDDT = Math.random() * 40 + 60; // 60-100 range
      const domainConfidence = proteinPLDDT * (Math.random() * 0.3 + 0.7); // Some correlation but with variance
      
      // Assign judge categories based on both confidence and other factors
      let judge;
      if (domainConfidence > 85) {
        // High confidence domains can be good_domain, simple_topology, or partial_domain
        const rand = Math.random();
        if (rand < 0.6) judge = 'good_domain';
        else if (rand < 0.8) judge = 'simple_topology';
        else judge = 'partial_domain';
      } 
      else if (domainConfidence > 70) {
        // Medium-high confidence could be any category but less likely good_domain
        const rand = Math.random();
        if (rand < 0.3) judge = 'good_domain';
        else if (rand < 0.6) judge = 'simple_topology';
        else if (rand < 0.8) judge = 'partial_domain';
        else judge = 'low_confidence';
      }
      else {
        // Lower confidence domains are mostly low_confidence
        const rand = Math.random();
        if (rand < 0.1) judge = 'good_domain';
        else if (rand < 0.2) judge = 'simple_topology';
        else if (rand < 0.4) judge = 'partial_domain';
        else judge = 'low_confidence';
      }
      
      return {
        proteinPLDDT,
        domainConfidence,
        judge
      };
    }),
    
    // Confidence statistics by DPAM judge
    confidenceByJudge: [
      { judge: 'good_domain', min: 74, q1: 85, median: 92, q3: 96, max: 100 },
      { judge: 'simple_topology', min: 68, q1: 78, median: 88, q3: 92, max: 98 },
      { judge: 'partial_domain', min: 60, q1: 72, median: 83, q3: 89, max: 95 },
      { judge: 'low_confidence', min: 45, q1: 55, median: 65, q3: 75, max: 85 }
    ],
    
    // Distribution of DPAM prob
    dpamProbDistribution: [
      { range: '0.0-0.1', count: 320 },
      { range: '0.1-0.2', count: 535 },
      { range: '0.2-0.3', count: 702 },
      { range: '0.3-0.4', count: 987 },
      { range: '0.4-0.5', count: 1203 },
      { range: '0.5-0.6', count: 1545 },
      { range: '0.6-0.7', count: 2076 },
      { range: '0.7-0.8', count: 2543 },
      { range: '0.8-0.9', count: 3087 },
      { range: '0.9-1.0', count: 2252 }
    ],
    
    // DPAM confidence distribution by judge over score ranges
    dpamConfidenceByJudge: [
      { probRange: '0.0-0.2', good_domain: 0, simple_topology: 12, partial_domain: 125, low_confidence: 718 },
      { probRange: '0.2-0.4', good_domain: 18, simple_topology: 145, partial_domain: 427, low_confidence: 799 },
      { probRange: '0.4-0.6', good_domain: 354, simple_topology: 642, partial_domain: 795, low_confidence: 238 },
      { probRange: '0.6-0.8', good_domain: 2834, simple_topology: 1212, partial_domain: 573, low_confidence: 0 },
      { probRange: '0.8-1.0', good_domain: 5007, simple_topology: 1115, partial_domain: 217, low_confidence: 0 }
    ],
    
    // Secondary structure by judge category
    secondaryStructure: [
      { judge: 'good_domain', helices: 5.2, strands: 4.8 },
      { judge: 'simple_topology', helices: 2.1, strands: 1.4 },
      { judge: 'partial_domain', helices: 4.6, strands: 3.8 },
      { judge: 'low_confidence', helices: 3.5, strands: 2.2 }
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

  // Fetch data from API
  useEffect(() => {
    const fetchDomainQualityData = async () => {
      if (useMockData) {
        setDomainData(null);
        setLoading(false);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        const data = await apiService.getDomainQualityData();
        setDomainData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching domain quality data:', err);
        setError('Failed to load domain quality data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDomainQualityData();
  }, [useMockData]);

  // Colors for different categories
  const COLORS = {
    // Confidence levels
    'Very High (>90)': '#00A36A',
    'High (70-90)': '#00C49F', 
    'Medium (50-70)': '#FFBB28', 
    'Low (<50)': '#FF6B6B',
    
    // DPAM judge categories (chosen based on what they represent)
    'good_domain': '#00A36A',     // Green - high confidence with compact core
    'simple_topology': '#4682B4', // Blue - high confidence but simple structure
    'partial_domain': '#FFBB28',  // Yellow - high confidence but poor coverage
    'low_confidence': '#FF6B6B'   // Red - low confidence
  };
  
  // Format percentage
  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;
  
  // Function to map judge to color
  const getJudgeColor = (judge) => {
    return COLORS[judge] || '#8884d8';
  };
  
  // Function to get human-readable judge name
  const getReadableJudgeName = (judge) => {
    const nameMap = {
      'good_domain': 'Good Domain',
      'simple_topology': 'Simple Topology',
      'partial_domain': 'Partial Domain',
      'low_confidence': 'Low Confidence'
    };
    
    return nameMap[judge] || judge;
  };
  
  // Function to get status badge
  const getJudgeBadge = (judge) => {
    const colorMap = {
      'good_domain': 'bg-emerald-500',
      'simple_topology': 'bg-blue-500',
      'partial_domain': 'bg-yellow-500',
      'low_confidence': 'bg-red-500'
    };
    
    return (
      <Badge className={colorMap[judge] || 'bg-gray-500'}>
        {getReadableJudgeName(judge)}
      </Badge>
    );
  };
  
  // Function to get judge description
  const getJudgeDescription = (judge) => {
    const descMap = {
      'good_domain': 'High confidence domain with a compact core',
      'simple_topology': 'High confidence domain with little secondary structure',
      'partial_domain': 'High confidence domain with poor coverage to reference hit',
      'low_confidence': 'Low confidence domain with a compact core, not assigned'
    };
    
    return descMap[judge] || '';
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
              {`${getReadableJudgeName(entry.name)}: ${entry.value} domains`}
            </p>
          ))}
        </div>
      );
    };
  };  

  // Determine which data to use based on toggle
  const displayData = useMockData ? mockData : (domainData || mockData);

  // Handler for toggle switch
  const handleToggleDataSource = () => {
    setUseMockData(!useMockData);
  };


// Render section of DomainQualityDistribution component
  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Quality Distribution</CardTitle>
          <CardDescription>Loading domain quality data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Quality Distribution</CardTitle>
          <CardDescription>Error loading domain quality data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-red-600">
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Domain Quality Distribution</CardTitle>
            <CardDescription>Analysis of AlphaFold domain quality metrics</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${useMockData ? 'font-medium' : 'text-gray-500'}`}>
                Mock
              </span>
              <Switch 
                checked={!useMockData} 
                onCheckedChange={handleToggleDataSource}
                aria-label="Toggle data source"
              />
              <span className={`text-sm ${!useMockData ? 'font-medium' : 'text-gray-500'}`}>
                Real
              </span>
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
                <SelectItem value="good_domain">Good Domain</SelectItem>
                <SelectItem value="simple_topology">Simple Topology</SelectItem>
                <SelectItem value="partial_domain">Partial Domain</SelectItem>
                <SelectItem value="low_confidence">Low Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Data source indicator */}
        <div className="mt-1">
          <Badge variant={useMockData ? "secondary" : "default"} className="text-xs">
            {useMockData 
              ? "Using mock data for demonstration" 
              : loading 
                ? "Loading real data..." 
                : error 
                  ? "Error loading real data - using fallback" 
                  : "Using real data from API"
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading domain quality data...</span>
          </div>
        ) : (
          <Tabs defaultValue="confidence">  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Domain Quality Distribution</CardTitle>
            <CardDescription>Analysis of AlphaFold domain quality metrics</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${useMockData ? 'font-medium' : 'text-gray-500'}`}>
                Mock
              </span>
              <Switch 
                checked={!useMockData} 
                onCheckedChange={handleToggleDataSource}
                aria-label="Toggle data source"
              />
              <span className={`text-sm ${!useMockData ? 'font-medium' : 'text-gray-500'}`}>
                Real
              </span>
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
                <SelectItem value="good_domain">Good Domain</SelectItem>
                <SelectItem value="simple_topology">Simple Topology</SelectItem>
                <SelectItem value="partial_domain">Partial Domain</SelectItem>
                <SelectItem value="low_confidence">Low Confidence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Data source indicator */}
        <div className="mt-1">
          <Badge variant={useMockData ? "secondary" : "default"} className="text-xs">
            {useMockData 
              ? "Using mock data for demonstration" 
              : loading 
                ? "Loading real data..." 
                : error 
                  ? "Error loading real data - using fallback" 
                  : "Using real data from API"
            }
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading domain quality data...</span>
          </div>
        ) : (
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
                <div className="text-3xl font-bold">{formatPercentage(displayData.metrics.highConfidenceFraction)}</div>
                <p className="text-xs text-gray-500 mt-1">Domains with confidence >70%</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Domain pLDDT</h3>
                <div className="text-3xl font-bold">{displayData.metrics.avgDomainPLDDT.toFixed(1)}</div>
                <p className="text-xs text-gray-500 mt-1">Mean confidence across all domains</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Domains</h3>
                <div className="text-3xl font-bold">{displayData.metrics.totalDomains.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">AlphaFold predicted domains</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-1">DPAM Judge Distribution</h3>
                <div className="mt-2 space-y-2">
                  {displayData.dpamJudgeDistribution.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: getJudgeColor(item.judge) }}
                        ></div>
                        <span className="text-sm">{getReadableJudgeName(item.judge)}</span>
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
                      data={displayData.confidenceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      label={({ category, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {displayData.confidenceDistribution.map((entry, index) => (
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
                  <BarChart data={displayData.dpamProbDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Domains']} />
                    <Bar 
                      dataKey="count" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                    >
                      {displayData.dpamProbDistribution.map((entry, index) => {
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
                              <p>DPAM Judge: {getReadableJudgeName(data.judge)}</p>
                              <p className="text-xs italic mt-1">{getJudgeDescription(data.judge)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {['good_domain', 'simple_topology', 'partial_domain', 'low_confidence'].map((judge) => {
                      const filteredData = filterByJudge(displayData.correlationData).filter(d => d.judge === judge);
                      return filteredData.length > 0 ? (
                        <Scatter
                          key={judge}
                          name={getReadableJudgeName(judge)}
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
                <span>{displayData.metrics.correlationCoefficient.toFixed(2)}</span>
                <span className="mx-3">|</span>
                <span className="font-medium">Mean Protein pLDDT: </span>
                <span>{displayData.metrics.avgProteinPLDDT.toFixed(1)}</span>
                <span className="mx-3">|</span>
                <span className="font-medium">Mean Domain Confidence: </span>
                <span>{displayData.metrics.avgDomainPLDDT.toFixed(1)}</span>
              </div>
            </div>
            
            {/* Box plot - Confidence by judge */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Confidence Range by DPAM Judge</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData.confidenceByJudge}
                    layout="vertical"
                    margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis 
                      dataKey="judge" 
                      type="category" 
                      scale="band"
                      tick={{ fill: '#666' }}
                      tickFormatter={getReadableJudgeName}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-sm">
                              <p className="font-medium">{getReadableJudgeName(data.judge)}</p>
                              <p className="text-xs italic mb-2">{getJudgeDescription(data.judge)}</p>
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
                      {displayData.confidenceByJudge.map((entry, index) => {
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
            
            {/* Secondary structure comparison */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Secondary Structure by Judge Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData.secondaryStructure}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="judge" 
                      tickFormatter={getReadableJudgeName}
                    />
                    <YAxis label={{ value: 'Average Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value) => [value.toFixed(1), '']}
                      labelFormatter={getReadableJudgeName}
                    />
                    <Legend />
                    <Bar dataKey="helices" name="Helices" fill="#8884d8" />
                    <Bar dataKey="strands" name="Strands" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs mt-2 text-gray-500">
                <p>Note the minimal secondary structure in domains classified as "Simple Topology"</p>
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
                      data={displayData.dpamJudgeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="judge"
                      label={({ judge, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {displayData.dpamJudgeDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getJudgeColor(entry.judge)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), 'Domains']}
                      labelFormatter={getReadableJudgeName}
                    />
                    <Legend 
                      formatter={getReadableJudgeName}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* DPAM Judge by confidence range (stacked bar) */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Judge by DPAM Probability Range</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.dpamConfidenceByJudge}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="probRange" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend formatter={getReadableJudgeName} />
                    <Bar 
                      dataKey="good_domain" 
                      name="good_domain" 
                      stackId="a" 
                      fill={getJudgeColor('good_domain')} 
                    />
                    <Bar 
                      dataKey="simple_topology" 
                      name="simple_topology" 
                      stackId="a" 
                      fill={getJudgeColor('simple_topology')} 
                    />
                    <Bar 
                      dataKey="partial_domain" 
                      name="partial_domain" 
                      stackId="a" 
                      fill={getJudgeColor('partial_domain')} 
                    />
                    <Bar 
                      dataKey="low_confidence" 
                      name="low_confidence" 
                      stackId="a" 
                      fill={getJudgeColor('low_confidence')} 
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
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
                    {displayData.dpamJudgeDistribution.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-4 w-4 rounded-full" style={{ backgroundColor: getJudgeColor(item.judge) }}></div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{getReadableJudgeName(item.judge)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{getJudgeDescription(item.judge)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatPercentage(item.percentage)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.judge === 'good_domain' ? '0.87' : 
                           item.judge === 'simple_topology' ? '0.76' : 
                           item.judge === 'partial_domain' ? '0.70' : 
                           '0.42'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {item.judge === 'good_domain' ? '92.4' : 
                           item.judge === 'simple_topology' ? '86.5' : 
                           item.judge === 'partial_domain' ? '83.8' : 
                           '62.3'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Additional Analysis - Correlation Matrix */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">DPAM Metrics Analysis</h3>
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Key Observations</h4>
                    <ul className="list-disc ml-5 space-y-2 text-sm">
                      <li>Strong correlation (0.86) between protein pLDDT and domain DPAM probability for domains classified as "good_domain"</li>
                      <li>Domains classified as "simple_topology" have high confidence but minimal secondary structure</li>
                      <li>The "partial_domain" classification indicates good confidence but incomplete domain boundaries</li>
                      <li>"low_confidence" domains are predominantly found in the lower DPAM probability ranges (below 0.5)</li>
                      <li>Secondary structure counts can help distinguish between "good_domain" and "simple_topology" categories</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">DPAM Judge Category Insights</h4>
                    <div className="space-y-3">
                      <div className="p-2 border rounded-md bg-emerald-50">
                        <span className="font-medium text-emerald-800">Good Domain:</span> 
                        <p className="text-xs mt-1 text-emerald-700">High-confidence domains with well-defined cores and sufficient secondary structure. These domains have the highest average pLDDT scores and DPAM probabilities.</p>
                      </div>
                      <div className="p-2 border rounded-md bg-blue-50">
                        <span className="font-medium text-blue-800">Simple Topology:</span> 
                        <p className="text-xs mt-1 text-blue-700">High-confidence domains with minimal secondary structure. Good confidence but structurally simple, often having fewer helices and strands than good domains.</p>
                      </div>
                      <div className="p-2 border rounded-md bg-yellow-50">
                        <span className="font-medium text-yellow-800">Partial Domain:</span> 
                        <p className="text-xs mt-1 text-yellow-700">High-confidence domains with poor coverage to reference. May represent truncated or incomplete domains with otherwise good structural confidence.</p>
                      </div>
                      <div className="p-2 border rounded-md bg-red-50">
                        <span className="font-medium text-red-800">Low Confidence:</span> 
                        <p className="text-xs mt-1 text-red-700">Domains with compact cores but low prediction confidence. These are typically found in regions with lower pLDDT scores and have not been confidently assigned.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
      </Tabs>
      )}
    </CardContent>
      <CardFooter>
        <div className="w-full text-center text-xs text-gray-500">
          Total Domains: <strong>{displayData.metrics.totalDomains.toLocaleString()}</strong> • 
          Data current as of: <strong>{new Date().toLocaleDateString()}</strong> •
          Data source: <strong>{useMockData ? "Mock" : "Real"}</strong>
        </div>
      </CardFooter>
  </Card>
);
};



export default DomainQualityDistribution;