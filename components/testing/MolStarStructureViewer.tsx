import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Info } from 'lucide-react';
import { useMolStar } from '../hooks/useMolStar';

// Example domain structure - in a real app, this would be fetched from your API
const mockDomainData = {
  id: 'd3k2i.1',
  name: 'Carboxylesterase domain',
  unp_acc: 'P23141',
  t_group: '2008.1.1',
  t_group_name: 'Alpha/Beta-Hydrolases',
  species: 'Homo sapiens',
  range: '40-568'
};

const MolStarStructureViewer = ({ 
  pdbId = null, 
  domainId = null,
  domainData = null,
  height = 500
}) => {
  const [activeTab, setActiveTab] = useState('structure');
  const [representationStyle, setRepresentationStyle] = useState('cartoon');
  const [colorScheme, setColorScheme] = useState('chain');
  
  const {
    containerRef,
    isInitialized,
    isLoading,
    error,
    initViewer,
    loadStructure,
    setRepresentation,
    resetView,
    takeScreenshot
  } = useMolStar();
  
  // Initialize viewer when component mounts
  useEffect(() => {
    if (containerRef.current) {
      initViewer(containerRef.current);
    }
  }, []);
  
  // Load structure when pdbId or domainId changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const loadMolecule = async () => {
      try {
        if (pdbId) {
          await loadStructure({ pdbId });
        } else if (domainId) {
          // In a real app, you would fetch domain structure data based on domainId
          // For now, we'll just use a mock structure
          await loadStructure({ data: 'MOCK_DOMAIN_STRUCTURE' });
        }
        
        // Apply the current representation style and color scheme
        await setRepresentation(representationStyle, { color: colorScheme });
      } catch (err) {
        console.error('Error loading molecule:', err);
      }
    };
    
    if (pdbId || domainId) {
      loadMolecule();
    }
  }, [isInitialized, pdbId, domainId]);
  
  // Apply representation when style or color scheme changes
  useEffect(() => {
    if (!isInitialized || isLoading) return;
    
    setRepresentation(representationStyle, { color: colorScheme })
      .catch(err => console.error('Error applying representation:', err));
  }, [isInitialized, representationStyle, colorScheme]);
  
  // Handle reset view button click
  const handleResetView = () => {
    resetView().catch(err => console.error('Error resetting view:', err));
  };
  
  // Handle screenshot button click
  const handleScreenshot = async () => {
    try {
      const dataUrl = await takeScreenshot();
      if (dataUrl) {
        // Create a download link
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `structure-${pdbId || domainId || 'view'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error taking screenshot:', err);
    }
  };
  
  // Determine what we're displaying
  const displayingDomain = Boolean(domainId || domainData);
  const domain = domainData || (domainId ? mockDomainData : null);
  
  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="controls">Display Controls</TabsTrigger>
        </TabsList>
        
        <TabsContent value="structure" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>
                  {displayingDomain 
                    ? `Domain Structure: ${domain?.id}`
                    : pdbId 
                      ? `PDB Structure: ${pdbId}`
                      : 'Molecular Structure Viewer'}
                </CardTitle>
                {isInitialized && !error && !isLoading && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">Viewer Ready</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 flex items-start mb-4">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : null}
              
              <div 
                ref={containerRef} 
                style={{ 
                  width: '100%', 
                  height: `${height}px`, 
                  position: 'relative',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '0.375rem',
                  overflow: 'hidden'
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                    <div className="flex flex-col items-center">
                      <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                      <p className="text-gray-700">Loading structure...</p>
                    </div>
                  </div>
                )}
                
                {!isInitialized && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Info className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p>Structure viewer is initializing...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleResetView}
                    disabled={!isInitialized || isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleScreenshot}
                    disabled={!isInitialized || isLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Screenshot
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Style:</span>
                    <select 
                      className="text-sm border rounded px-2 py-1"
                      value={representationStyle}
                      onChange={(e) => setRepresentationStyle(e.target.value)}
                      disabled={!isInitialized || isLoading}
                    >
                      <option value="cartoon">Cartoon</option>
                      <option value="ball-stick">Ball & Stick</option>
                      <option value="surface">Surface</option>
                      <option value="ribbon">Ribbon</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Color:</span>
                    <select 
                      className="text-sm border rounded px-2 py-1"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      disabled={!isInitialized || isLoading}
                    >
                      <option value="chain">Chain</option>
                      <option value="residue">Residue Type</option>
                      <option value="secondary">Secondary Structure</option>
                      <option value="rainbow">Rainbow</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Structure Information</CardTitle>
            </CardHeader>
            <CardContent>
              {displayingDomain ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Domain ID</h3>
                    <p className="mt-1 text-lg">{domain?.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">UniProt Accession</h3>
                    <p className="mt-1 text-lg">{domain?.unp_acc}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">T-Group</h3>
                    <p className="mt-1">{domain?.t_group} ({domain?.t_group_name})</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Species</h3>
                    <p className="mt-1">{domain?.species}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sequence Range</h3>
                    <p className="mt-1">{domain?.range}</p>
                  </div>
                </div>
              ) : pdbId ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">PDB ID</h3>
                  <p className="mt-1 text-xl">{pdbId}</p>
                  <p className="mt-4 text-gray-500">
                    In a real implementation, additional structure metadata would be displayed here,
                    such as title, authors, resolution, experimental method, etc.
                  </p>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <Info className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No structure loaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="controls" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Representation Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['cartoon', 'ball-stick', 'surface', 'ribbon'].map(style => (
                      <Button 
                        key={style}
                        variant={representationStyle === style ? "default" : "outline"}
                        onClick={() => setRepresentationStyle(style)}
                        disabled={!isInitialized || isLoading}
                        className="justify-center text-center"
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Color Scheme</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['chain', 'residue', 'secondary', 'rainbow'].map(scheme => (
                      <Button 
                        key={scheme}
                        variant={colorScheme === scheme ? "default" : "outline"}
                        onClick={() => setColorScheme(scheme)}
                        disabled={!isInitialized || isLoading}
                        className="justify-center text-center"
                      >
                        {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleResetView}
                      disabled={!isInitialized || isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset View
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleScreenshot}
                      disabled={!isInitialized || isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Screenshot
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MolStarStructureViewer;