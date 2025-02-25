// /hooks/useActivityFeed.tsx
import { useState, useEffect, useCallback } from 'react';
import apiService from '@/services/api';

export interface ActivityItem {
  id: string;
  action: string; // 'reclassified', 'validated', 'flagged', 'created', 'updated'
  timestamp: string;
  user: string;
  clusterName?: string;
  details?: {
    fromTGroup?: string;
    toTGroup?: string;
    confidence?: string;
    reason?: string;
    [key: string]: any;
  };
}

interface UseActivityFeedReturn {
  data: ActivityItem[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  filterByAction: (action: string | null) => void;
  selectedAction: string | null;
}

export function useActivityFeed(initialLimit: number = 5): UseActivityFeedReturn {
  const [data, setData] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(initialLimit);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const fetchData = useCallback(async (currentPage: number, shouldReplace: boolean = true) => {
    try {
      setLoading(true);
      
      const response = await apiService.getDashboardActivity({
        page: currentPage,
        limit,
        action: selectedAction
      });
      
      if (response.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (shouldReplace) {
        setData(response);
      } else {
        setData(prevData => [...(prevData || []), ...response]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading activity feed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  }, [limit, selectedAction]);

  useEffect(() => {
    // Reset page and fetch data when selectedAction changes
    setPage(1);
    fetchData(1);
  }, [fetchData, selectedAction]);

  const refresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      setPage(1);
      await fetchData(1);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchData(nextPage, false);
  };

  const filterByAction = (action: string | null) => {
    setSelectedAction(action);
  };

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    loadMore,
    hasMore,
    filterByAction,
    selectedAction
  };
}