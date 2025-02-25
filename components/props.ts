// components/props.ts

// Classification Status Dashboard Props
export interface ClassificationStatusDashboardProps {
  selectedClusterSet: string;
  onClusterSetChange: (value: string) => void;
  clusterSets: Array<{
    id: number;
    name: string;
    clusters: number;
    domains: number;
    taxonomicCoverage: number;
  }>;
  classificationData: {
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
      needsReview: number;
      conflicts: number;
      unclassified: number;
    }>;
  } | null;
  onRefresh: () => void;
  refreshing: boolean;
}

// Reclassification Stats Props
export interface ReclassificationStatsProps {
  reclassificationsData: {
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
  } | null;
  onRefresh: () => void;
  refreshing: boolean;
}

// Structure Quality Visualization Props
export interface StructureQualityVisualizationProps {
  structureQualityData: {
    qualityMetrics: Array<{
      clusterSize: number;
      structureConsistency: number;
      experimentalSupport: number;
      plddt: number;
      tgroupHomogeneity: number;
      clusterSet: string;
      source: string;
    }>;
    clusterSetAverages: Array<{
      name: string;
      avgStructureConsistency: number;
      avgExperimentalSupport: number;
      avgPlddt: number;
      avgTgroupHomogeneity: number;
    }>;
  } | null;
  onRefresh: () => void;
  refreshing: boolean;
}