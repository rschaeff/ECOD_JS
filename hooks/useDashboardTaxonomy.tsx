// hooks/useDashboardTaxonomy.tsx
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

interface TaxonomyStat {
  kingdom: string;
  domains: number;
  clusters: number;
}

interface TGroupStat {
  tgroup: string;
  count: number;
}

interface ClassificationStat {
  status: string;
  count: number;
  percentage: number;
}

interface ClusterSet {
  id: number;
  name: string;
}

interface TaxonomyData {
  taxonomyStats: TaxonomyStat[];
  tgroupDistribution: TGroupStat[];
  classificationStats: ClassificationStat[];
  clusterSets: ClusterSet[];
  totalClusters: number;
  taxonomicCoverage: number;
  classifiedRate: number;
}

interface UseDashboardTaxonomyReturn {
  data: TaxonomyData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshing: boolean;
  filterByClusterSet: (clusterId: string) => TaxonomyData | null;
}

export function useDashboardTaxonomy(): UseDashboardTaxonomyReturn {
  const [data, setData] = useState<TaxonomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardTaxonomy();
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error loading taxonomy data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await apiService.getDashboardTaxonomy();
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error refreshing taxonomy data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  // Filter data by cluster set ID
  const filterByClusterSet = (clusterId: string): TaxonomyData | null => {
    if (!data) return null;
    if (clusterId === 'all') return data;

    // This would be a real implementation that filters based on the API response structure
    // For this example, let's assume we need to make a new API call with the filter
    // But in a real implementation with nested structure you could filter locally
    
    // Simulated filtering for example purposes (in reality this would use the API data structure)
    const filteredTaxonomyStats = data.taxonomyStats.map(stat => ({
      ...stat,
      domains: Math.round(stat.domains * 0.8), // Simulate filtering
      clusters: Math.round(stat.clusters * 0.8)
    }));

    const filteredTGroupDist = data.tgroupDistribution.map(stat => ({
      ...stat,
      count: Math.round(stat.count * 0.8) // Simulate filtering
    }));

    return {
      ...data,
      taxonomyStats: filteredTaxonomyStats,
      tgroupDistribution: filteredTGroupDist,
      totalClusters: Math.round(data.totalClusters * 0.8)
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    filterByClusterSet
  };
}