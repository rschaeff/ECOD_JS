import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { ClusterMember } from '@/types';

export const useClusterMembers = (
  clusterId: string | number | undefined,
  initialPage = 1,
  pageSize = 10
) => {
  const [members, setMembers] = useState<ClusterMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  
  const fetchMembers = async (pageNumber = page) => {
    if (!clusterId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getClusterMembers(Number(clusterId), {
        page: pageNumber,
        limit: pageSize
      });
      
      setMembers(response.members);
      setTotalCount(response.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load cluster members. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch members when clusterId or page changes
  useEffect(() => {
    fetchMembers();
  }, [clusterId, page, pageSize]);
  
  return {
    members,
    loading,
    error,
    totalCount,
    page,
    setPage,
    pageSize,
    refetch: fetchMembers,
    pageCount: Math.ceil(totalCount / pageSize)
  };
};