import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export interface StructureQualityData {
  // Statistics by structure source
  sourceDistribution: {
    source: string; // 'AlphaFold', 'Experimental', 'ESMFold', etc.
    count: number;
    percentage: number;
  }[];
  
  // Quality metrics distribution
  qualityDistribution: {
    category: string; // 'Very high', 'High', 'Medium', 'Low', 'Very low'
    count: number;
    percentage: number;
  }[];
  
  // Structure resolution distribution (for experimental)
  resolutionDistribution: {
    range: string; // '<2.0Å', '2.0-2.5Å', '2.5-3.0Å', '3.0-3.5Å', '>3.5Å'
    count: number;
    percentage: number;
  }[];
  
  // pLDDT score distribution (for predicted)
  pLDDTDistribution: {
    range: string; // '90-100', '70-90', '50-70', '<50'
    count: number;
    percentage: number;
  }[];
  
  // Overall quality metrics
  metrics: {
    averagePLDDT: number;
    averageResolution: number;
    percentageHighQuality: number;
    percentageExperimental: number;
    totalStructures: number;
    structuresWithDomains: number;
  };
  
  // Time series data (optional)
  qualityOverTime: {
    month: string; // 'Jan 2025', 'Feb 2025', etc.
    averagePLDDT: number;
    countPredicted: number;
    countExperimental: number;
  }[];
}

interface UseStructureQualityDataReturn {
  data: StructureQualityData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshing: boolean;
  filterBySource: (source: string | null) => void;
  selectedSource: string | null;
}

export function useStructureQualityData(): UseStructureQualityDataReturn {
  const [data, setData] = useState<StructureQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStructureQualityData(selectedSource);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error loading structure quality data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const response = await apiService.getStructureQualityData(selectedSource);
      setData(response);
      setError(null);
    } catch (error) {
      console.error('Error refreshing structure quality data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  const filterBySource = (source: string | null) => {
    setSelectedSource(source);
  };

  // Update data when source filter changes
  useEffect(() => {
    fetchData();
  }, [selectedSource]);

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    filterBySource,
    selectedSource
  };
}