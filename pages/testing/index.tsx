import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Info } from 'lucide-react';

// A minimal mock PDB data for testing
const MOCK_PDB_DATA = `HEADER    MOCK STRUCTURE FOR TESTING
ATOM      1  N   ALA A   1      -0.525   1.362   0.000  1.00  0.00           N
ATOM      2  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C
ATOM      3  C   ALA A   1       1.520   0.000   0.000  1.00  0.00           C
ATOM      4  O   ALA A   1       2.197   0.891   0.000  1.00  0.00           O
ATOM      5  CB  ALA A   1      -0.507  -0.781  -1.207  1.00  0.00           C
ATOM      6  N   ALA A   2       2.116  -1.195   0.000  1.00  0.00           N
ATOM      7  CA  ALA A   2       3.571  -1.149   0.000  1.00  0.00           C
ATOM      8  C   ALA A   2       4.097  -0.370  -1.207  1.00  0.00           C
ATOM      9  O   ALA A   2       5.097  -0.754  -1.824  1.00  0.00           O
ATOM     10  CB  ALA A   2       4.078  -2.579   0.000  1.00  0.00           C
TER
END`;

// For demonstration purposes - in a real app these would come from an API
const TEST_PDB_IDS = ['1cbs', '1ubq', '3pqr', '4hhb', '6lyz', '1tim'];
const TEST_DOMAINS = [
  { id: 'd3k2i.1', name: 'Carboxylesterase domain', size: 325 },
  { id: 'd4cce.1', name: 'Calcium-binding EGF domain', size: 178 },
  { id: 'd3vjk.1', name: 'Immunoglobulin-like domain', size: 210 },
  { id: 'e4q1q.1', name: 'TIM barrel domain', size: 417 },
  { id: 'e5v1h.1', name: 'Rossmann fold domain', size: 298 }
];

const MolStarTestingEnvironment = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [dataSource, setDataSource] = useState('mock');
  const [pdbId, setPdbId] = useState('');
  const [domainId, setDomainId] = useState('');
  const [mockData, setMockData] = useState(MOCK_PDB_DATA);
  const [loading, setLoading] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [error, setError] = useState(null);
  
  const viewerContainerRef = useRef(null);
  const molstarInstanceRef = useRef(null);

  // Mock function to simulate loading structures
  const loadStructure = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate error for specific PDB ID for testing error handling
      if (pdbId === '3pqr' && dataSource === 'pdb') {
        throw new Error('Error fetching PDB structure: Network timeout');
      }
      
      // In a real implementation, this is where you would:
      // 1. Either fetch PDB data from a URL 
      // 2. Or use the mock data provided
      // 3. Then initialize the Mol* viewer with the data
      
      setViewerReady(true);
    } catch (err) {
      setError(err.message);
      setViewerReady(false);
    } finally {
      setLoading(false);
    }
  };

  // Simulated effect to initialize Mol* (would be replaced with actual Mol* initialization)
  useEffect(() => {
    if (!viewerContainerRef.current || !viewerReady) return;
    
    // This simulates what would normally be Mol* initialization code
    // In a real implementation, you would:
    // 1. Initialize Mol* viewer
    // 2. Load the structure data
    // 3. Set up default representation
    
    const initMockViewer = () => {
      const container = viewerContainerRef.current;
      
      // For the mock implementation, just show a representation of the data
      const sourceText = dataSource === 'mock' 
        ? 'Using mock PDB data'
        : dataSource === 'pdb'
          ? `Loading PDB ID: ${pdbId}`
          : `Loading domain structure: ${domainId}`;
      
      // Simple mock representation of a structure viewer
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
          <div class="mb-4 text-center">
            <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              ${sourceText}
            </span>
          </div>
          <div class="w-full max-w-lg bg-white border rounded p-4 mb-4 overflow-auto max-h-32">
            <pre class="text-xs text-gray-700">${dataSource === 'mock' ? mockData.slice(0, 500) + (mockData.length > 500 ? '...' : '') : '# PDB data would be loaded here'}</pre>
          </div>
          <div class="relative w-full h-64 bg-black rounded-lg flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse"></div>
            <div class="relative z-10 text-white text-center">
              <div class="text-2xl font-bold mb-2">Mol* Viewer</div>
              <p class="text-sm max-w-md">This is a placeholder. In a real implementation, a 3D molecular structure would be rendered here using Mol*.</p>
            </div>
          </div>
          <div class="mt-4 text-center text-sm text-gray-500">
            <p>In production, this would be an interactive 3D molecular viewer powered by Mol*.</p>
            <p class="mt-1">For testing purposes, UI interactions work but 3D rendering is simulated.</p>
          </div>
        </div>
      `;
    };
    
    initMockViewer();
    
    // Cleanup function
    return () => {
      if (molstarInstanceRef.current) {
        // In a real implementation, this would dispose of the Mol* instance
        molstarInstanceRef.current = null;
      }
      
      if (viewerContainerRef.current) {
        viewerContainerRef.current.innerHTML = '';
      }
    };
  }, [viewerReady, dataSource, pdbId, domainId, mockData]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mol* Structure Viewer Testing</h1>
          <p className="text-gray-500 mt-1">Test environment for 3D molecular visualization</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Set up the molecular viewer with different data sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data Source</label>
                  <Tabs value={dataSource} onValueChange={setDataSource}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="mock">Mock Data</TabsTrigger>
                      <TabsTrigger value="pdb">PDB ID</TabsTrigger>
                      <TabsTrigger value="domain">Domain</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {dataSource === 'pdb' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select PDB ID</label>
                    <Select value={pdbId} onValueChange={setPdbId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose PDB ID" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_PDB_IDS.map(id => (
                          <SelectItem key={id} value={id}>{id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Select '3pqr' to test error handling
                    </p>
                  </div>
                )}
                
                {dataSource === 'domain' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Domain</label>
                    <Select value={domainId} onValueChange={setDomainId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_DOMAINS.map(domain => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.id} - {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {dataSource === 'mock' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Edit Mock PDB Data</label>
                    <Textarea 
                      value={mockData}
                      onChange={(e) => setMockData(e.target.value)}
                      className="font-mono text-xs h-40"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Modify this PDB data to test the viewer with different structures
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={loadStructure} 
                  disabled={loading || (dataSource === 'pdb' && !pdbId) || (dataSource === 'domain' && !domainId)}
                  className="w-full"
                >
                  {loading ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
                  ) : (
                    'Load Structure'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Visualization Controls</CardTitle>
              <CardDescription>
                Customize the molecular visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Style</label>
                  <Select defaultValue="cartoon">
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="ball-stick">Ball & Stick</SelectItem>
                      <SelectItem value="surface">Surface</SelectItem>
                      <SelectItem value="ribbon">Ribbon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Color Scheme</label>
                  <Select defaultValue="chain">
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chain">Chain</SelectItem>
                      <SelectItem value="residue">Residue Type</SelectItem>
                      <SelectItem value="secondary">Secondary Structure</SelectItem>
                      <SelectItem value="bfactor">B-Factor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2 space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export as Image
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Structure Viewer</CardTitle>
                  <CardDescription>
                    {viewerReady 
                      ? `Displaying ${dataSource === 'mock' ? 'mock structure' : dataSource === 'pdb' ? `PDB: ${pdbId}` : `Domain: ${domainId}`}`
                      : 'No structure loaded'}
                  </CardDescription>
                </div>
                {viewerReady && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ready
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 flex items-start">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading structure</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={viewerContainerRef} 
                  className="bg-gray-100 border rounded-md"
                  style={{ width: '100%', height: '500px', position: 'relative' }}
                >
                  {!viewerReady && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Info className="h-10 w-10 mb-2 text-gray-400" />
                      <p>Select a data source and click "Load Structure" to begin</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MolStarTestingEnvironment;