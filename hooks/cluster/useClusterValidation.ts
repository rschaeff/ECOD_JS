import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { ValidationData } from '@/types';

/**
 * Hook for fetching and managing cluster validation data
 * 
 * @param clusterId - The ID of the cluster to fetch validation data for
 * @param enabled - Boolean flag to control when data fetching happens (useful for tab-based loading)
 */
export const useClusterValidation = (
  clusterId: string | number | undefined,
  enabled = false
) => {
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchValidationData = async () => {
    if (!clusterId || !enabled) return;
    
    try {
      setLoading(true);
      const response = await apiService.getClusterValidation(Number(clusterId));
      setValidationData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching validation data:', err);
      setError('Failed to load validation data. Please try again later.');
      setValidationData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch validation data when clusterId changes or enabled becomes true
  useEffect(() => {
    if (enabled) {
      fetchValidationData();
    }
  }, [clusterId, enabled]);
  
  // Helper function to get validation status color
  const getStatusColor = () => {
    if (!validationData) return '';
    
    switch (validationData.classificationAssessment.status) {
      case 'Valid':
        return 'green';
      case 'Invalid':
        return 'red';
      case 'Needs Review':
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  // Helper function to get overall quality score (0-1)
  const getOverallQualityScore = () => {
    if (!validationData) return 0;
    
    // Calculate weighted average of various metrics
    const structureWeight = 0.4;
    const taxonomyWeight = 0.4;
    const experimentalWeight = 0.2;
    
    const structureScore = validationData.structuralValidation.structureConsistency || 0;
    const taxonomyScore = validationData.taxonomicValidation.taxonomicDiversity || 0;
    const experimentalScore = validationData.structuralValidation.experimentalSupport || 0;
    
    return (
      structureScore * structureWeight +
      taxonomyScore * taxonomyWeight +
      experimentalScore * experimentalWeight
    );
  };
  
  return {
    validationData,
    loading,
    error,
    refetch: fetchValidationData,
    statusColor: getStatusColor(),
    qualityScore: getOverallQualityScore()
  };
};