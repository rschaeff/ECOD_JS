// hooks/useDashboardSummary.tsx
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export function useDashboardSummary() {
  const [data, setData] = useState<{
    totalClusters: number;
    totalDomains: number;
    needsReview: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDashboardSummary();
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error loading summary:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await apiService.getDashboardSummary();
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error refreshing summary:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh, refreshing };
}