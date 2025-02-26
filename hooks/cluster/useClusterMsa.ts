import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { MSAData } from '@/types';

/**
 * Hook for fetching and managing Multiple Sequence Alignment data
 * 
 * @param clusterId - The ID of the cluster to fetch MSA data for
 * @param enabled - Boolean flag to control when data fetching happens (useful for tab-based loading)
 */
export const useClusterMsa = (
  clusterId: string | number | undefined, 
  enabled = false
) => {
  const [msaData, setMsaData] = useState<MSAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMsaData = async () => {
    if (!clusterId || !enabled) return;
    
    try {
      setLoading(true);
      const response = await apiService.getClusterMSA(Number(clusterId));
      setMsaData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching MSA data:', err);
      setError('Failed to load sequence alignment data. Please try again later.');
      setMsaData(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch MSA data when clusterId changes or enabled becomes true
  useEffect(() => {
    if (enabled) {
      fetchMsaData();
    }
  }, [clusterId, enabled]);
  
  // Utility function to get conserved regions as an array of ranges
  const getConservedRegions = () => {
    if (!msaData || !msaData.conserved_positions) return [];
    
    // Parse conserved_positions string into array of ranges
    // Format is typically "10-15,25-30,45-60"
    return msaData.conserved_positions.split(',').map(range => {
      const [start, end] = range.split('-').map(Number);
      return { start, end };
    });
  };
  
  // Utility function to get gap regions as an array of ranges
  const getGapRegions = () => {
    if (!msaData || !msaData.gap_positions) return [];
    
    return msaData.gap_positions.split(',').map(range => {
      const [start, end] = range.split('-').map(Number);
      return { start, end };
    });
  };
  
  return {
    msaData,
    loading,
    error,
    refetch: fetchMsaData,
    getConservedRegions,
    getGapRegions
  };
};