// types/index.ts
export interface Domain {
  id: number;
  unp_acc: string;
  domain_id: string;
  range: string;
  t_group: string;
  t_group_name?: string;
  hit_ecod_domain_uid?: string;
  hit_ecod_domain_id?: string;
}

export interface DomainStructure {
  id: number;
  domain_id: number;
  file_path: string;
  file_type: string;
  source: 'alphafold' | 'experimental' | 'custom';
  source_version?: string;
  extraction_method: string;
  extraction_date: string;
  resolution?: number;
  mean_plddt?: number;
  clash_score?: number;
  ramachandran_outliers?: number;
  sidechain_outliers?: number;
  best_experimental_hit_pdb?: string;
  best_hit_tm_score?: number;
  best_hit_rmsd?: number;
  best_hit_seq_identity?: number;
  experimental_validation_date?: string;
  file_hash?: string;
  file_size?: number;
  last_verified?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ClusterDetail {
  cluster: {
    id: number;
    cluster_number: number;
    cluster_set_id: number;
    created_at: string;
  };
  clusterSet: {
    id: number;
    name: string;
    method: string;
    sequence_identity: number;
    description?: string;
    created_at: string;
  };
  members: ClusterMember[];
  representative: ClusterMember | null;
  analysis: {
    id: number;
    cluster_id: number;
    taxonomic_diversity: number | null;
    structure_consistency: number | null;
    experimental_support_ratio: number | null;
    requires_new_classification: boolean;
    analysis_notes?: string;
  } | null;
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

export interface ClusterMember {
  id: number;
  cluster_id: number;
  domain_id: number;
  sequence_identity: number;
  alignment_coverage: number;
  is_representative: boolean;
  domain?: Domain;
  species?: string;
}

export interface MSAData {
  id: number;
  cluster_id: number;
  alignment_length: number;
  num_sequences: number;
  avg_identity: number;
  avg_coverage?: number;
  alignment_data: string;
  conserved_positions?: string;
  gap_positions?: string;
  alignment_score?: number;
  created_at?: string;
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