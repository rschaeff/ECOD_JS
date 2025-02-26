// /hooks/usePriorityClusters.ts
// /hooks/usePriorityClusters.ts
import { useState, useEffect } from 'react';
import apiService, { PriorityCluster, PriorityClustersResponse } from '@/services/api';

// Hook interface
interface UsePriorityClustersResult {
  data: PriorityCluster[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  refreshing: boolean;
  totals: PriorityClustersResponse['totals'] | null;
}

export function usePriorityClusters(limit: number = 5, category: string = 'all'): UsePriorityClustersResult {
  const [data, setData] = useState<PriorityCluster[] | null>(null);
  const [totals, setTotals] = useState<PriorityClustersResponse['totals'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusters = async (isRefreshing: boolean = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Call the API service method
      const response = await apiService.getPriorityClusters({
        limit,
        category: category !== 'all' ? category as any : undefined,
        exclude_singletons: true
      });
      
      setData(response.clusters);
      setTotals(response.totals);
      setError(null);
    } catch (err) {
      console.error('Error fetching priority clusters:', err);
      setError(err instanceof Error ? err.message : 'Failed to load priority clusters');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchClusters();
  }, [limit, category]);

  // Function to manually refresh data
  const refresh = () => {
    if (refreshing) return;
    fetchClusters(true);
  };

  return { data, totals, loading, error, refresh, refreshing };
}

// Optional: Alternative implementation if you need to mock data for development
export function usePriorityClustersMock(limit: number = 5): UsePriorityClustersResult {
  const [data, setData] = useState<PriorityCluster[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = () => {
    // Mock data generator function
    const mockCategories: Array<'unclassified' | 'flagged' | 'reclassification' | 'diverse'> = 
      ['unclassified', 'flagged', 'reclassification', 'diverse'];
    
    const mockClusters: PriorityCluster[] = [];
    
    for (let i = 0; i < limit; i++) {
      const categoryIndex = i % mockCategories.length;
      mockClusters.push({
        id: `cluster-${i + 100}`,
        name: `Cluster-${i + 100}`,
        size: Math.floor(Math.random() * 20) + 2, // Random size between 2-21 (no singletons)
        category: mockCategories[categoryIndex],
        representativeDomain: `d${Math.floor(Math.random() * 10000)}.1`,
        taxonomicDiversity: Math.random() * 0.8 + 0.1, // Random value between 0.1-0.9
        structuralDiversity: mockCategories[categoryIndex] === 'diverse' ? Math.random() * 0.8 + 0.1 : undefined,
        t_group: `${Math.floor(Math.random() * 3000)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
        t_group_name: mockCategories[categoryIndex] === 'unclassified' ? undefined : 'Alpha/Beta-Hydrolases'
      });
    }
    
    return mockClusters;
  };

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [limit]);

  // Function to manually refresh data
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    
    // Simulate refresh with slight delay
    setTimeout(() => {
      setData(generateMockData());
      setRefreshing(false);
    }, 800);
  };

  return { data, loading, error, refresh, refreshing };
}