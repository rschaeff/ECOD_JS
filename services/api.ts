
// services/api.ts
import axios from 'axios';

// Define base API URL from environment or default
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || '/api';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Optional: Add authentication token if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);


// Interface Definitions
export interface DomainCluster {
  id: number;
  cluster_number: number;
  cluster_set_id: number;
  created_at: string;
}

export interface ClusterSet {
  id: number;
  name: string;
  method: string;
  sequence_identity: number;
  description?: string;
  created_at: string;
}

export interface ClusterMember {
  id: number;
  cluster_id: number;
  domain_id: number;
  sequence_identity: number;
  alignment_coverage: number;
  is_representative: boolean;
  domain?: Domain;
}

export interface Domain {
  id: number;
  unp_acc: string;
  domain_id: string;
  range: string;
  t_group: string;
}

export interface ClusterAnalysis {
  id: number;
  cluster_id: number;
  taxonomic_diversity: number | null;
  structure_consistency: number | null;
  experimental_support_ratio: number | null;
  requires_new_classification: boolean;
  analysis_notes?: string;
}

export interface TaxonomyData {
  tax_id: number;
  scientific_name: string;
  rank: string;
  phylum?: string;
  superkingdom?: string;
}

export interface ClusterDetail {
  cluster: DomainCluster;
  clusterSet: ClusterSet;
  members: ClusterMember[];
  analysis: ClusterAnalysis | null;
  representative: ClusterMember | null;
  taxonomyDistribution: {
    distinctFamilies: number;
    distinctPhyla: number;
    superkingdoms: string[];
    taxonomicDiversity: number | null;
  };
  tGroupDistribution: {
    t_group: string;
    count: number;
    name?: string;
  }[];
  taxonomyStats: {
    phylum: string;
    count: number;
  }[];
  speciesDistribution: {
    species: string;
    count: number;
  }[];
  size: number;
}

export interface DashboardData {
  totalClusters: number;
  totalDomains: number;
  needsReview: number;
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }[];
  clusterSets: {
    id: number;
    name: string;
    clusters: number;
    domains: number;
    taxonomicCoverage: number;
  }[];
  taxonomyStats: {
    kingdom: string;
    domains: number;
    clusters: number;
  }[];
  tgroupDistribution: {
    tgroup: string;
    count: number;
  }[];
  pendingReclassifications: {
    id: string;
    name: string;
    currentTGroup: string;
    proposedTGroup: string;
    confidence: string;
  }[];
  recentClusters: {
    id: string;
    name: string;
    size: number;
    taxonomicDiversity: number;
    representativeDomain: string;
  }[];
}

export interface MSAData {
  id: number;
  cluster_id: number;
  alignment_length: number;
  num_sequences: number;
  avg_identity: number;
  alignment_data: string;
  conserved_positions?: string;
  gap_positions?: string;
}

export interface ValidationData {
  structuralValidation: {
    structureConsistency: number;
    experimentalSupport: number;
  };
  taxonomicValidation: {
    taxonomicDiversity: number;
    tgroupHomogeneity: number;
  };
  classificationAssessment: {
    status: 'Valid' | 'Invalid' | 'Needs Review';
    notes: string;
  };
}


// Modify the API service to use internal API routes
const apiService = {
  // Dashboard data
   async getDashboardSummary() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/summary`);
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard summary: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  async getDashboardClusterSets() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/clustersets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cluster sets: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching cluster sets:', error);
      throw error;
    }
  },

   async getDashboardTaxonomy() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/taxonomy`);
      if (!response.ok) {
        throw new Error(`Failed to fetch taxonomy data: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching taxonomy data:', error);
      throw error;
    }
  },

  async getDashboardActivity() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/activity`);
      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching activity data:', error);
      throw error;
    }
  },

  async getDashboardReclassifications() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/reclassifications`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reclassifications: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching reclassifications:', error);
      throw error;
    }
  },

  async getDashboardRecentClusters() {
    try {
      const response = await fetch(`${BASE_API_URL}/dashboard/recentclusters`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recent clusters: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching recent clusters:', error);
      throw error;
    }
  },

  // For backward compatibility - fetches all dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [summary, clusterSets, taxonomyData, activity, reclassifications, recentClusters] = 
        await Promise.all([
          this.getDashboardSummary(),
          this.getDashboardClusterSets(),
          this.getDashboardTaxonomy(),
          this.getDashboardActivity(),
          this.getDashboardReclassifications(),
          this.getDashboardRecentClusters()
        ]);
      
      return {
        ...summary,
        clusterSets,
        taxonomyStats: taxonomyData.taxonomyStats,
        tgroupDistribution: taxonomyData.tgroupDistribution,
        recentActivity: activity,
        pendingReclassifications: reclassifications,
        recentClusters
      };
    } catch (error) {
      console.error('Error fetching complete dashboard data:', error);
      throw error;
    }
  },

  // Cluster Sets
  async getClusterSets(): Promise<ClusterSet[]> {
    try {
      const response = await fetch(`${BASE_API_URL}/clustersets`);
      if (!response.ok) {
        throw new Error('Failed to fetch cluster sets');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching cluster sets:', error);
      throw error;
    }
  },

  // Single Cluster Set
  async getClusterSet(id: number): Promise<ClusterSet> {
    try {
      const response = await fetch(`${BASE_API_URL}/clustersets/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cluster set ${id}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching cluster set ${id}:`, error);
      throw error;
    }
  },

  // Clusters
  async getClusters(params?: {
    clusterset_id?: number,
    t_group?: string,
    tax_id?: number,
    page?: number,
    limit?: number
  }): Promise<{
    clusters: DomainCluster[],
    total: number,
    page: number,
    pageSize: number
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/clusters?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch clusters');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching clusters:', error);
      throw error;
    }
  },

  // Single Cluster
  async getCluster(id: number): Promise<ClusterDetail> {
    try {
      const response = await fetch(`${BASE_API_URL}/clusters/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch cluster ${id}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching cluster ${id}:`, error);
      throw error;
    }
  },

  // Cluster Members
  async getClusterMembers(clusterId: number, params?: {
    page?: number,
    limit?: number
  }): Promise<{
    members: ClusterMember[],
    total: number,
    page: number,
    pageSize: number
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/clusters/${clusterId}/members?${queryParams}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch members for cluster ${clusterId}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching members for cluster ${clusterId}:`, error);
      throw error;
    }
  },

  // MSA data for a cluster
  async getClusterMSA(clusterId: number): Promise<MSAData> {
    try {
      const response = await fetch(`${BASE_API_URL}/clusters/${clusterId}/msa`);
      if (!response.ok) {
        throw new Error(`Failed to fetch MSA for cluster ${clusterId}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching MSA for cluster ${clusterId}:`, error);
      throw error;
    }
  },

  // Validation data for a cluster
  async getClusterValidation(clusterId: number): Promise<ValidationData> {
    try {
      const response = await fetch(`${BASE_API_URL}/clusters/${clusterId}/validation`);
      if (!response.ok) {
        throw new Error(`Failed to fetch validation for cluster ${clusterId}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching validation for cluster ${clusterId}:`, error);
      throw error;
    }
  },

  // Search endpoint
  async searchDomains(query: string, params?: {
    t_group?: string,
    tax_id?: number,
    page?: number,
    limit?: number
  }): Promise<{
    domains: Domain[],
    total: number,
    page: number,
    pageSize: number
  }> {
    try {
      const queryParams = new URLSearchParams({ query });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to search domains');
      }
      return response.json();
    } catch (error) {
      console.error('Error searching domains:', error);
      throw error;
    }
  }
};

export default apiService;