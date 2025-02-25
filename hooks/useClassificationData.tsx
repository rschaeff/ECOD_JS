// /hooks/useClassificationData.tsx
import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';

export interface ClassificationStatusData {
  statusDistribution: {
    status: string; // 'Validated', 'Needs Review', 'Conflicting', 'Unclassified'
    count: number;
    percentage: number;
  }[];
  
  tgroupConsistency: {
    tgroup: string;
    consistencyScore: number;
    domainCount: number;
  }[];
  
  confidentAssignments: number;
  needsReviewCount: number;
  conflictingCount: number;
  unclassifiedCount: number;
  totalDomains: number;
  classificationRate: number;
  
  taxonomyDistribution: {
    kingdom: string;
    classifiedCount: number;
    unclassifiedCount: number;
    totalCount: number;
    classificationRate: number;
  }[];
  
  recentReclassifications: {
    id: string;
    name: string;
    previousGroup: string;
    newGroup: string;
    confidence: string;
    date: string;
  }[];
}

export interface UseClassificationDataReturn {
  data: ClassificationStatusData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  filter: (filterType: string, value: string) => void;
  clearFilters: () => void;
  filters: { [key: string]: string };
}

export function useClassificationData(): UseClassificationDataReturn {
  const [data, setData] = useState<ClassificationStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Apply filters to API call if any are set
      const appliedFilters = Object.keys(filters).length > 0 ? filters : undefined;
      const response = await apiService.getClassificationData(appliedFilters);
      
      setData(response);
      setError(null);
    } catch (err) {
      console.error('Error loading classification data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load classification data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filter = (filterType: string, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    filter,
    clearFilters,
    filters
  };
}