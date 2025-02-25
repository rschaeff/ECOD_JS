// /hooks/useRecentClusters.tsx
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export interface RecentCluster {
  id: string;
  name: string;
  size: number;
  taxonomicDiversity: number;
  representativeDomain: string;
  created_at: string;
  modified_at: string;
  status?: 'new' | 'updated' | 'flagged';
  t_group?: string;
}

interface UseRecentClustersReturn {
  data: RecentCluster[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshing: boolean;
  filterByStatus: (status?: string) => RecentCluster[];
}

export function useRecentClusters(limit: number = 5): UseRecentClustersReturn {
  const [data, setData] = useState<RecentCluster[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardRecentClusters(limit);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error loading recent clusters:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await apiService.getDashboardRecentClusters(limit);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error refreshing recent clusters:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter clusters by status
  const filterByStatus = (status?: string): RecentCluster[] => {
    if (!data) return [];
    if (!status || status === 'all') return data;
    
    return data.filter(cluster => cluster.status === status);
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    filterByStatus
  };
}