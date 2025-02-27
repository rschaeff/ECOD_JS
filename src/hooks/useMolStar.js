// src/hooks/useMolStar.js
import { useState, useEffect, useRef } from 'react';
import { createMolStarViewer } from '../lib/MolStarViewer';

/**
 * React hook for using MolStar in React components
 * @param {Object} options - Configuration options
 * @param {boolean} [options.loadOnMount=false] - Whether to initialize Mol* on component mount
 * @param {string} [options.defaultPdbId] - Default PDB ID to load
 * @returns {Object} MolStar hook interface
 */
export function useMolStar(options = {}) {
  const { loadOnMount = false, defaultPdbId = null } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPdbId, setCurrentPdbId] = useState(defaultPdbId);
  
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  
  // Initialize the viewer
  const initViewer = async (container) => {
    if (isInitialized || !container) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would dynamically import Mol* here if needed
      // For example: const { createPluginUI } = await import('molstar/lib/mol-plugin-ui');
      
      // Create viewer instance
      viewerRef.current = createMolStarViewer();
      await viewerRef.current.init(container);
      
      setIsInitialized(true);
      
      // Load default PDB ID if provided
      if (defaultPdbId) {
        await loadStructure({ pdbId: defaultPdbId });
      }
    } catch (err) {
      console.error('Failed to initialize MolStar viewer:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize viewer');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load a structure
  const loadStructure = async (loadOptions = {}) => {
    if (!viewerRef.current || !isInitialized) {
      setError('Viewer not initialized. Call initViewer first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await viewerRef.current.loadStructure(loadOptions);
      
      if (loadOptions.pdbId) {
        setCurrentPdbId(loadOptions.pdbId);
      }
    } catch (err) {
      console.error('Failed to load structure:', err);
      setError(err instanceof Error ? err.message : 'Failed to load structure');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set representation style
  const setRepresentation = async (style, repOptions = {}) => {
    if (!viewerRef.current || !isInitialized) {
      setError('Viewer not initialized. Call initViewer first.');
      return;
    }
    
    try {
      await viewerRef.current.setRepresentation(style, repOptions);
    } catch (err) {
      console.error('Failed to set representation:', err);
      setError(err instanceof Error ? err.message : 'Failed to set representation');
    }
  };
  
  // Reset view
  const resetView = async () => {
    if (!viewerRef.current || !isInitialized) {
      setError('Viewer not initialized. Call initViewer first.');
      return;
    }
    
    try {
      await viewerRef.current.resetView();
    } catch (err) {
      console.error('Failed to reset view:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset view');
    }
  };
  
  // Take screenshot
  const takeScreenshot = async () => {
    if (!viewerRef.current || !isInitialized) {
      setError('Viewer not initialized. Call initViewer first.');
      return null;
    }
    
    try {
      return await viewerRef.current.takeScreenshot();
    } catch (err) {
      console.error('Failed to take screenshot:', err);
      setError(err instanceof Error ? err.message : 'Failed to take screenshot');
      return null;
    }
  };
  
  // Use effect for initialization and cleanup
  useEffect(() => {
    if (loadOnMount && containerRef.current) {
      initViewer(containerRef.current);
    }
    
    // Cleanup function
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
        viewerRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [loadOnMount]);
  
  // Return the hook interface
  return {
    // Refs
    containerRef,
    viewerRef,
    
    // State
    isInitialized,
    isLoading,
    error,
    currentPdbId,
    
    // Methods
    initViewer,
    loadStructure,
    setRepresentation,
    resetView,
    takeScreenshot,
  };
}

export default useMolStar;