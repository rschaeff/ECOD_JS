import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { Domain, DomainStructure } from '@/types';

export const useStructureData = (
  domainId: number | undefined,
  enabled = false
) => {
  const [structureData, setStructureData] = useState<DomainStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStructureData = async () => {
    if (!domainId || !enabled) return;
    
    try {
      setLoading(true);
      const data = await apiService.getDomainStructure(domainId);
      setStructureData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching structure data:', err);
      setError('Failed to load structure data. Please try again.');
      setStructureData(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStructureData();
  }, [domainId, enabled]);
  
  return {
    structureData,
    loading,
    error,
    refetch: fetchStructureData
  };
};
