import { useState, useEffect } from 'react';
import { useClusterData } from './useClusterData';
import { useClusterMsa } from './useClusterMsa';
import { useClusterValidation } from './useClusterValidation';
import { useStructureData } from './useStructureData';

/**
 * Combines multiple cluster-related hooks into a single hook for ease of use
 * This reduces the need to manage multiple hook states in the main component
 */
export const useCombinedClusterData = (clusterId: string | number | undefined) => {
  const [activeTab, setActiveTab] = useState('members');
  const [selectedDomain, setSelectedDomain] = useState(null);
  
  // Main cluster data
  const clusterData = useClusterData(clusterId);
  
  // MSA data - only loaded when alignment tab is active
  const msaData = useClusterMsa(
    clusterId, 
    activeTab === 'alignment'
  );
  
  // Validation data - only loaded when validation tab is active
  const validationData = useClusterValidation(
    clusterId, 
    activeTab === 'validation'
  );
  
  // Structure data - only loaded when structure tab is active and a domain is selected
  const structureData = useStructureData(
    selectedDomain?.id, 
    activeTab === 'structure' && !!selectedDomain
  );
  
  // Set initial selected domain to representative when cluster data loads
  useEffect(() => {
    if (clusterData.data?.representative?.domain && !selectedDomain) {
      setSelectedDomain(clusterData.data.representative.domain);
    }
  }, [clusterData.data]);
  
  // Handle domain selection and switch to structure tab
  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setActiveTab('structure');
  };
  
  // Provide a single refetch function for all data
  const refetchAll = async () => {
    clusterData.refetch();
    
    if (activeTab === 'alignment') {
      msaData.refetch();
    } else if (activeTab === 'validation') {
      validationData.refetch();
    } else if (activeTab === 'structure' && selectedDomain) {
      structureData.refetch();
    }
  };
  
  return {
    // Basic state
    activeTab,
    setActiveTab,
    selectedDomain,
    setSelectedDomain,
    handleDomainSelect,
    
    // Data hooks
    clusterData,
    msaData,
    validationData,
    structureData,
    
    // Utilities
    refetchAll,
    
    // Loading and error states
    isLoading: clusterData.loading || 
               (activeTab === 'alignment' && msaData.loading) ||
               (activeTab === 'validation' && validationData.loading) ||
               (activeTab === 'structure' && structureData.loading),
    
    hasError: !!clusterData.error || 
              (activeTab === 'alignment' && !!msaData.error) ||
              (activeTab === 'validation' && !!validationData.error) ||
              (activeTab === 'structure' && !!structureData.error)
  };
};