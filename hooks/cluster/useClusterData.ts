import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { ClusterDetail } from '@/types';

export const useClusterData = (id: string | number | undefined) => {
  const [data, setData] = useState<ClusterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await apiService.getCluster(Number(id));
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching cluster data:', err);
      setError('Failed to load cluster data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [id]);
  
  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};