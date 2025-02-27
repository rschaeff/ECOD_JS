import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Download, FileText, Maximize2, Minimize2, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// This component integrates Mol* viewer for structure visualization
const MoleculeViewer = ({ 
  pdbId = null,
  pdbUrl = null,
  title = "Protein Structure Viewer",
  description = "Visualize and explore 3D protein structures", 
  initialRenderStyle = "cartoon", 
  width = "100%",
  height = "500px",
  isFullScreen = false,
  onToggleFullScreen = () => {},
  isLoading = false
}) => {
  const viewerContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [renderStyle, setRenderStyle] = useState(initialRenderStyle);
  const [colorScheme, setColorScheme] = useState("chain");
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState(isLoading);
  const [molstarLoaded, setMolstarLoaded] = useState(false);
  
  // Load Mol* plugin and scripts
  useEffect(() => {
    // This would normally be loaded in the head of the HTML document
    // or imported as NPM modules, but for this example we'll load it dynamically
    const loadMolstarScripts = async () => {
      if (window.molstar) {
        setMolstarLoaded(true);
        return;
      }
      
      try {
        // Load Mol* CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://cdn.jsdelivr.net/npm/molstar@3.37.0/lib/mol-plugin-ui/skin/light.css';
        document.head.appendChild(linkElement);
        
        // Load Mol* JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/molstar@3.37.0/build/molstar.js';
        script.async = true;
        
        const scriptPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            setMolstarLoaded(true);
            resolve();
          };
          script.onerror = reject;
        });
        
        document.body.appendChild(script);
        await scriptPromise;
        
        console.log('Mol* scripts loaded successfully');
      } catch (err) {
        console.error('Error loading Mol* scripts:', err);
        setError('Failed to load structure viewer library');
      }
    };
    
    loadMolstarScripts();
  }, []);
  
  // Initialize the viewer when molstar is loaded
  useEffect(() => {
    if (!molstarLoaded || !viewerContainerRef.current) return;
    
    const initViewer = async () => {
      try {
        setLoadingState(true);
        
        // Clean up any existing viewer
        if (viewer) {
          viewer.dispose();
        }
        
        if (!window.molstar || !window.molstar.Viewer) {
          throw new Error('Mol* Viewer not found');
        }
        
        // Create new Mol* viewer instance
        const molstarViewer = new window.molstar.Viewer(viewerContainerRef.current, {
          layout: {
            controlsDisplay: 'hidden',
            regionState: {
              bottom: 'collapsed',
              left: 'collapsed',
              right: 'collapsed',
              top: 'collapsed'
            }
          },
          viewport: {
            showExpand: true,
            showControls: true
          },
          plugin: {
            customParamEditorTabs: []
          }
        });
        
        setViewer(molstarViewer);
        
        // Load structure data
        if (pdbId && molstarViewer.loadPdb) {
          await molstarViewer.loadPdb(pdbId);
          console.log(`Loaded PDB ID: ${pdbId}`);
        } else if (pdbUrl && molstarViewer.loadStructureFromUrl) {
          await molstarViewer.loadStructureFromUrl(pdbUrl, 'pdb');
          console.log(`Loaded PDB from URL: ${pdbUrl}`);
        } else if (molstarViewer.loadPdb) {
          // Load a default structure if no ID or URL provided
          await molstarViewer.loadPdb('1cbs');
          console.log('Loaded default structure (1cbs)');
        } else {
          console.warn('Structure loading methods not available');
        }
        
        // Apply initial rendering style
        await applyRenderingStyle(molstarViewer, initialRenderStyle);
        await applyColorScheme(molstarViewer, colorScheme);
        
        setError(null);
      } catch (err) {
        console.error('Error initializing Mol* viewer:', err);
        setError('Failed to initialize structure viewer: ' + err.message);
      } finally {
        setLoadingState(false);
      }
    };
    
    initViewer();
    
    // Cleanup function
    return () => {
      if (viewer) {
        try {
          viewer.dispose();
        } catch (err) {
          console.error('Error disposing viewer:', err);
        }
      }
    };
  }, [pdbId, pdbUrl, molstarLoaded]);
  
  // Helper functions for rendering styles and color schemes with error handling
  const applyRenderingStyle = async (moleculeViewer, style) => {
    if (!moleculeViewer || !moleculeViewer.updateRepresentation) {
      console.warn('Representation update method not available');
      return;
    }
    
    try {
      switch (style) {
        case 'cartoon':
          await moleculeViewer.updateRepresentation({ type: 'cartoon' });
          break;
        case 'ball-and-stick':
          await moleculeViewer.updateRepresentation({ type: 'ball-and-stick' });
          break;
        case 'spacefill':
          await moleculeViewer.updateRepresentation({ type: 'spacefill' });
          break;
        case 'surface':
          await moleculeViewer.updateRepresentation({ type: 'surface' });
          break;
        default:
          await moleculeViewer.updateRepresentation({ type: 'cartoon' });
      }
      
      setRenderStyle(style);
    } catch (err) {
      console.error('Error applying rendering style:', err);
    }
  };
  
  const applyColorScheme = async (moleculeViewer, scheme) => {
    if (!moleculeViewer || !moleculeViewer.updateStyle) {
      console.warn('Style update method not available');
      return;
    }
    
    try {
      switch (scheme) {
        case 'chain':
          await moleculeViewer.updateStyle({ color: 'chain' });
          break;
        case 'residue':
          await moleculeViewer.updateStyle({ color: 'residue-type' });
          break;
        case 'secondary-structure':
          await moleculeViewer.updateStyle({ color: 'secondary-structure' });
          break;
        case 'temperature':
          await moleculeViewer.updateStyle({ color: 'b-factor' });
          break;
        default:
          await moleculeViewer.updateStyle({ color: 'chain' });
      }
      
      setColorScheme(scheme);
    } catch (err) {
      console.error('Error applying color scheme:', err);
    }
  };
  
  // Handle style change
  const handleRenderStyleChange = (value) => {
    setRenderStyle(value);
    applyRenderingStyle(viewer, value);
  };
  
  // Handle color scheme change
  const handleColorSchemeChange = (value) => {
    setColorScheme(value);
    applyColorScheme(viewer, value);
  };
  
  // Handle refresh with proper error handling
  const handleRefresh = () => {
    if (!window.molstar || !viewerContainerRef.current) {
      setError('Mol* viewer not available');
      return;
    }
    
    if (viewer) {
      try {
        viewer.dispose();
      } catch (err) {
        console.error('Error disposing viewer:', err);
      }
      setViewer(null);
    }
    
    // Re-initialize viewer
    const reinitViewer = async () => {
      try {
        setLoadingState(true);
        
        // Create new viewer instance
        const molstarViewer = new window.molstar.Viewer(viewerContainerRef.current, {
          layout: {
            controlsDisplay: 'hidden',
            regionState: {
              bottom: 'collapsed',
              left: 'collapsed',
              right: 'collapsed',
              top: 'collapsed'
            }
          },
          viewport: {
            showExpand: true,
            showControls: true
          },
          plugin: {
            customParamEditorTabs: []
          }
        });
        
        setViewer(molstarViewer);
        
        // Load structure data
        if (pdbId && molstarViewer.loadPdb) {
          await molstarViewer.loadPdb(pdbId);
        } else if (pdbUrl && molstarViewer.loadStructureFromUrl) {
          await molstarViewer.loadStructureFromUrl(pdbUrl, 'pdb');
        } else if (molstarViewer.loadPdb) {
          await molstarViewer.loadPdb('1cbs');
        }
        
        await applyRenderingStyle(molstarViewer, renderStyle);
        await applyColorScheme(molstarViewer, colorScheme);
        
        setError(null);
      } catch (err) {
        console.error('Error refreshing Mol* viewer:', err);
        setError('Failed to refresh structure viewer: ' + err.message);
      } finally {
        setLoadingState(false);
      }
    };
    
    reinitViewer();
  };
  
  // Download current view as image with error handling
  const handleDownloadImage = () => {
    if (!viewer) {
      setError('Viewer not initialized');
      return;
    }
    
    try {
      const canvas = viewerContainerRef.current.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${pdbId || 'structure'}_${renderStyle}_view.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Canvas element not found');
      }
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image: ' + err.message);
    }
  };
  
  return (
    <Card className={`${isFullScreen ? 'fixed inset-0 z-50 m-0 rounded-none overflow-hidden' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500">
              {pdbId || (pdbUrl ? 'Custom PDB' : 'Example Structure')}
            </Badge>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onToggleFullScreen()}
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <div className="flex gap-2">
            <Select value={renderStyle} onValueChange={handleRenderStyleChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rendering Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="ball-and-stick">Ball & Stick</SelectItem>
                <SelectItem value="spacefill">Spacefill</SelectItem>
                <SelectItem value="surface">Surface</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={colorScheme} onValueChange={handleColorSchemeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Color Scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chain">Chain</SelectItem>
                <SelectItem value="residue">Residue Type</SelectItem>
                <SelectItem value="secondary-structure">Secondary Structure</SelectItem>
                <SelectItem value="temperature">Temperature (B-factor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loadingState}>
              <RefreshCw className={`h-4 w-4 ${loadingState ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownloadImage} disabled={loadingState || error}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          ref={viewerContainerRef} 
          className="w-full border rounded-md overflow-hidden bg-white" 
          style={{ 
            height: isFullScreen ? 'calc(100vh - 150px)' : height,
            width: width,
            position: 'relative'
          }}
        >
          {/* Loading overlay */}
          {loadingState && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center z-10">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-gray-700">Loading structure...</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center z-10">
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  onClick={handleRefresh}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          {!error && !loadingState && (
            <p>
              Tip: Use mouse to rotate, scroll to zoom, and right-click to pan. Double-click on a residue to center view.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoleculeViewer;