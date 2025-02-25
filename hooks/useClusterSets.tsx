// /hooks/useClusterSets.tsx
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export interface ClusterSet {
  id: number;
  name: string;
  clusters: number;
  domains: number;
  taxonomicCoverage: number;
}

interface UseClusterSetsReturn {
  data: ClusterSet[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  filterByIdentity: (threshold: string) => ClusterSet[];
}

export function useClusterSets(): UseClusterSetsReturn {
  const [data, setData] = useState<ClusterSet[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const fetchedData = await apiService.getDashboardClusterSets();
      setData(fetchedData);
      setError(null);
    } catch (err) {
      console.error('Error loading cluster sets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cluster sets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const fetchedData = await apiService.getDashboardClusterSets();
      setData(fetchedData);
      setError(null);
    } catch (err) {
      console.error('Error refreshing cluster sets:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh cluster sets');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterByIdentity = (threshold: string): ClusterSet[] => {
    if (!data) return [];
    if (threshold === 'all') return data;
    
    return data.filter(set => {
      if (threshold === 'high') return set.taxonomicCoverage >= 0.9;
      if (threshold === 'medium') return set.taxonomicCoverage >= 0.7 && set.taxonomicCoverage < 0.9;
      if (threshold === 'low') return set.taxonomicCoverage < 0.7;
      return true;
    });
  };

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    filterByIdentity
  };
}