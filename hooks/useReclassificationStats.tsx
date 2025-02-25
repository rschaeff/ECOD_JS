import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export interface ReclassificationSummary {
  totalPending: number;
  totalCompleted: number;
  totalRejected: number;
  totalAuto: number;
  totalManual: number;
  weeklyStats: {
    week: string; // e.g., '2025-W08'
    pending: number;
    completed: number;
    rejected: number;
  }[];
  confidenceDistribution: {
    level: string; // 'high', 'medium', 'low'
    count: number;
    percentage: number;
  }[];
  topTGroups: {
    from: string;
    to: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    name: string;
    date: string;
    fromTGroup: string;
    toTGroup: string;
    confidence: string;
    status: 'pending' | 'completed' | 'rejected';
    user?: string;
  }[];
}

interface UseReclassificationStatsReturn {
  data: ReclassificationSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshing: boolean;
  setTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
  timeRange: 'week' | 'month' | 'quarter' | 'year';
}

export function useReclassificationStats(): UseReclassificationStatsReturn {
  const [data, setData] = useState<ReclassificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReclassificationStats(timeRange);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error loading reclassification stats:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await apiService.getReclassificationStats(timeRange);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error refreshing reclassification stats:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  // Update data when time range changes
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    setTimeRange,
    timeRange
  };
}