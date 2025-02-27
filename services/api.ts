// services/api.ts - Updated version with fixed endpoints
import axios from 'axios';

// Define base API URL from environment or default
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || '/api';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: BASE_API_URL,
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
  // Added for more complete representation
  clusters_count?: number;
  domains_count?: number;
  taxonomic_coverage?: number;
  flagged_clusters?: number;
  sizeDistribution?: Array<{ range: string; count: number }>;
  tGroupDistribution?: Array<{ 
    t_group: string; 
    name: string; 
    cluster_count: number; 
    domain_count: number; 
  }>;
}

export interface ClusterMember {
  id: number;
  cluster_id: number;
  domain_id: number;
  sequence_identity: number;
  alignment_coverage: number;
  is_representative: boolean;
  domain?: Domain;
  // Added to match the API response
  species?: string;
}

export interface Domain {
  id: number;
  unp_acc: string;
  domain_id: string;
  range: string;
  t_group: string;
  t_group_name?: string;
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

export interface ActivityLogEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  details: any;
  created_at: string;
}

export interface ActivityLogResponse {
  logs: ActivityLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  summary: {
    actions: Array<{ action: string; count: number }>;
    recentUsers: Array<{ 
      user_id: string; 
      activity_count: number;
      last_active: string;
    }>;
  };
}

export interface ClassificationData {
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  tgroupConsistency: Array<{
    name: string;
    value: number;
  }>;
  comparisonData: Array<{
    name: string;
    validated: number;
    needs_review: number;
    conflicts: number;
    unclassified: number;
  }>;
}

export interface StructureQualityData {
  qualityMetrics: Array<{
    cluster_size: number;
    structure_consistency: number;
    experimental_support_ratio: number;
    tgroup_homogeneity: number;
    plddt: number;
    cluster_set: string;
    source: string;
  }>;
  clusterSetAverages: Array<{
    name: string;
    avg_structure_consistency: number;
    avg_experimental_support: number;
    avg_plddt: number;
    avg_tgroup_homogeneity: number;
  }>;
}

export interface ReclassificationStats {
  items: Array<{
    id: string;
    name: string;
    currentTGroup: string;
    proposedTGroup: string;
    confidence: string;
  }>;
  reasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  confidenceLevels: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
  priorityTasks: Array<{
    name: string;
    count: number;
    priority: string;
  }>;
  reviewStats: {
    reviewed: number;
    pending: number;
    highPriority: number;
  };
}

export interface SearchDomainResponse {
  domains: Array<Domain & {
    species?: string;
    phylum?: string;
    tax_id?: number;
    has_structure?: boolean;
    primary_cluster_id?: number;
  }>;
  total: number;
  page: number;
  pageSize: number;
  facets: {
    t_groups: Array<{ t_group: string; name: string; count: number }>;
    taxonomy: Array<{ superkingdom: string; count: number }>;
  };
}

export interface ReclassificationResponse {
  reclassifications: Array<{
    id: string;
    cluster_id: number;
    cluster_number: number;
    cluster_set_name: string;
    current_t_group: string;
    current_t_group_name: string | null;
    proposed_t_group: string;
    proposed_t_group_name: string | null;
    confidence: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: string | null;
    reviewed_at: string | null;
    created_at: string;
    representative_domain: string;
    taxonomic_diversity: number | null;
    structure_consistency: number | null;
    analysis_notes: string | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
  summary: {
    byConfidence: Array<{ confidence: string; count: number }>;
    byTGroup: Array<{ t_group: string; name: string; count: number }>;
  };
}

// Add this interface to the type definitions in services/api.ts
export interface PriorityCluster {
  id: string;
  name: string;
  size: number;
  category: 'unclassified' | 'flagged' | 'reclassification' | 'diverse';
  representativeDomain: string;
  taxonomicDiversity: number;
  structuralDiversity?: number;
  t_group?: string;
  t_group_name?: string;
  cluster_number: number;
  cluster_set_id: number;
  requires_new_classification?: boolean;
}

export interface PriorityClustersResponse {
  clusters: PriorityCluster[];
  totals: {
    unclassified: number;
    flagged: number;
    reclassification: number;
    diverse: number;
    all: number;
  };
}

// API service functions
const apiService = {
  // Dashboard data - split for better performance
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
  }): Promise<SearchDomainResponse> {
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
  },

  // Classification data
  async getClassificationData(): Promise<ClassificationData> {
    try {
      const response = await fetch(`${BASE_API_URL}/classification`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classification data:', error);
      throw error;
    }
  },

  // Structure quality data
  async getStructureQualityData(): Promise<StructureQualityData> {
    try {
      const response = await fetch(`${BASE_API_URL}/structure-quality`);
      return response.data;
    } catch (error) {
      console.error('Error fetching structure quality data:', error);
      throw error;
    }
  },

  // Reclassification statistics
  async getReclassificationStats(): Promise<ReclassificationStats> {
    try {
      const response = await fetch(`${BASE_API_URL}/reclassification-stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reclassification statistics:', error);
      throw error;
    }
  },

  // Added: Full activity logs endpoint
  async getActivityLogs(params?: {
    entity_type?: string,
    entity_id?: string,
    action?: string,
    user_id?: string,
    from_date?: string,
    to_date?: string,
    page?: number,
    limit?: number
  }): Promise<ActivityLogResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/activity?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity logs');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  },

  // Added: Full reclassifications endpoint
  async getReclassifications(params?: {
    status?: 'pending' | 'approved' | 'rejected' | 'all',
    confidence?: 'high' | 'medium' | 'low',
    cluster_set_id?: number,
    page?: number,
    limit?: number
  }): Promise<ReclassificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/reclassifications?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reclassifications');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching reclassifications:', error);
      throw error;
    }
  },

  // Added: Update reclassification status
  async updateReclassificationStatus(data: {
    cluster_id: number,
    status: 'approved' | 'rejected',
    user_id: string,
    notes?: string,
    new_t_group?: string
  }): Promise<{
    message: string,
    cluster_id: number,
    status: string,
    user_id: string,
    timestamp: string
  }> {
    try {
      const response = await api.post(`${BASE_API_URL}/reclassifications`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating reclassification status:', error);
      throw error;
    }
  },

  // Added: Test database connection
  async testDatabaseConnection(): Promise<any> {
    try {
      const response = await api.get(`${BASE_API_URL}/test-connection`);
      return response.data;
    } catch (error) {
      console.error('Error testing database connection:', error);
      throw error;
    }
  },

  // Add this method to the apiService object in services/api.ts
  async getPriorityClusters(params?: {
    limit?: number;
    category?: 'unclassified' | 'flagged' | 'reclassification' | 'diverse' | 'all';
    exclude_singletons?: boolean;
  }): Promise<PriorityClustersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`${BASE_API_URL}/clusters/priority?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch priority clusters');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching priority clusters:', error);
      throw error;
    }
  },

async getDomainStructure(domainId: number): Promise<StructureFile[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/domains/${domainId}/structure`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structures for domain ${domainId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structures for domain ${domainId}:`, error);
    throw error;
  }
},

async getProteinStructure(unpAcc: string): Promise<StructureFile[]> {
  try {
    const response = await fetch(`${BASE_API_URL}/proteins/${unpAcc}/structure`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structures for protein ${unpAcc}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structures for protein ${unpAcc}:`, error);
    throw error;
  }
},

async getStructureById(structureId: number): Promise<StructureViewerData> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/${structureId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structure with ID ${structureId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structure with ID ${structureId}:`, error);
    throw error;
  }
},

async getStructureFile(filePath: string): Promise<Blob> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/file?path=${encodeURIComponent(filePath)}`, {
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch structure file at ${filePath}`);
    }
    return response.blob();
  } catch (error) {
    console.error(`Error fetching structure file at ${filePath}:`, error);
    throw error;
  }
},

async compareStructures(structureId1: number, structureId2: number): Promise<StructureComparisonData> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/compare?ref=${structureId1}&target=${structureId2}`);
    if (!response.ok) {
      throw new Error(`Failed to compare structures ${structureId1} and ${structureId2}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error comparing structures ${structureId1} and ${structureId2}:`, error);
    throw error;
  }
},

async getClusterStructuralAlignment(clusterId: number): Promise<{
  representative_structure_id: number,
  aligned_structures: Array<{
    structure_id: number,
    domain_id: number,
    tm_score: number,
    rmsd: number
  }>
}> {
  try {
    const response = await fetch(`${BASE_API_URL}/clusters/${clusterId}/structural-alignment`);
    if (!response.ok) {
      throw new Error(`Failed to fetch structural alignment for cluster ${clusterId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching structural alignment for cluster ${clusterId}:`, error);
    throw error;
  }
},

async getStructureQualityAssessment(structureId: number): Promise<{
  plddt_scores?: number[],
  clash_score?: number,
  ramachandran_outliers?: number,
  sidechain_outliers?: number,
  overall_quality: 'excellent' | 'good' | 'fair' | 'poor'
}> {
  try {
    const response = await fetch(`${BASE_API_URL}/structures/${structureId}/quality`);
    if (!response.ok) {
      throw new Error(`Failed to fetch quality assessment for structure ${structureId}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching quality assessment for structure ${structureId}:`, error);
    throw error;
  }
}

};

export default apiService;