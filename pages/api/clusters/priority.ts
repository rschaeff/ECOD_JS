// pages/api/clusters/priority.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { PriorityCluster, PriorityClustersResponse } from '@/services/api';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse query parameters
    const { 
      limit = 10, 
      category = 'all', 
      exclude_singletons = true 
    } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const excludeSingletons = exclude_singletons === 'true' || exclude_singletons === true;

    // Get priority clusters from database
    const result = await getPriorityClusters(limitNum, category as string, excludeSingletons);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching priority clusters:', error);
    return res.status(500).json({ 
      message: 'Error fetching priority clusters', 
      error: (error as Error).message 
    });
  }
}

/**
 * Get priority clusters from the database
 */
async function getPriorityClusters(
  limit: number = 10,
  category: string = 'all',
  excludeSingletons: boolean = true
): Promise<PriorityClustersResponse> {
  // Base query parts
  let baseQuery = `
    WITH cluster_size AS (
      SELECT 
        cluster_id, 
        COUNT(*) as size
      FROM swissprot.domain_cluster_members
      GROUP BY cluster_id
    ),
    cluster_basics AS (
      SELECT 
        dc.id,
        dc.cluster_number,
        dc.cluster_set_id,
        dcs.name as cluster_set_name,
        cs.size,
        ca.taxonomic_diversity,
        ca.structure_consistency as structural_diversity,
        ca.requires_new_classification,
        CASE
          WHEN ca.id IS NULL THEN 'unclassified'
          WHEN ca.requires_new_classification = true THEN 'reclassification'
          WHEN ca.requires_new_classification = false AND 
               (ca.structure_consistency >= 0.8 OR ca.taxonomic_diversity >= 0.7) THEN 'diverse'
          WHEN ca.id IS NOT NULL AND 
               ca.analysis_notes LIKE '%flagged%' THEN 'flagged'
          ELSE 'unclassified'
        END as category,
        rep.domain_id as representative_domain,
        rep.t_group,
        tn.name as t_group_name
      FROM swissprot.domain_clusters dc
      JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
      JOIN cluster_size cs ON dc.id = cs.cluster_id
      LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      LEFT JOIN (
        SELECT dcm.cluster_id, d.domain_id, d.t_group
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        WHERE dcm.is_representative = true
      ) AS rep ON dc.id = rep.cluster_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = rep.t_group
      WHERE 1=1
  `;

  // Add singleton exclusion if requested
  if (excludeSingletons) {
    baseQuery += " AND cs.size > 1";
  }

  // Add category filter if specified
  if (category !== 'all') {
    baseQuery += ` AND CASE
      WHEN ca.id IS NULL THEN 'unclassified'
      WHEN ca.requires_new_classification = true THEN 'reclassification'
      WHEN ca.requires_new_classification = false AND 
           (ca.structure_consistency >= 0.8 OR ca.taxonomic_diversity >= 0.7) THEN 'diverse'
      WHEN ca.id IS NOT NULL AND 
           ca.analysis_notes LIKE '%flagged%' THEN 'flagged'
      ELSE 'unclassified'
    END = $1`;
  }

  // Get counts for each category
  const countQuery = `
    SELECT 
      SUM(CASE WHEN category = 'unclassified' THEN 1 ELSE 0 END) as unclassified,
      SUM(CASE WHEN category = 'flagged' THEN 1 ELSE 0 END) as flagged,
      SUM(CASE WHEN category = 'reclassification' THEN 1 ELSE 0 END) as reclassification,
      SUM(CASE WHEN category = 'diverse' THEN 1 ELSE 0 END) as diverse,
      COUNT(*) as all
    FROM (${baseQuery}) as categorized_clusters
  `;

  // Query to get the actual cluster data
  const dataQuery = `
    SELECT *
    FROM (${baseQuery}) as categorized_clusters
    ORDER BY 
      CASE 
        WHEN category = 'reclassification' THEN 1
        WHEN category = 'flagged' THEN 2
        WHEN category = 'unclassified' THEN 3
        WHEN category = 'diverse' THEN 4
        ELSE 5
      END,
      cluster_number DESC
    LIMIT $${category !== 'all' ? 2 : 1}
  `;

  // Execute the queries
  const params = category !== 'all' ? [category, limit] : [limit];
  
  // Add logging before executing queries
  console.log('Executing count SQL query:', countQuery);
  console.log('With count parameters:', category !== 'all' ? [category] : []);
  console.log('Executing data SQL query:', dataQuery);
  console.log('With data parameters:', params);
  
  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, category !== 'all' ? [category] : []),
    pool.query(dataQuery, params)
  ]);

  // Format the response
  const clusters: PriorityCluster[] = dataResult.rows.map(row => ({
    id: row.id.toString(),
    name: `Cluster-${row.id.toString()}`,
    size: row.size,
    category: row.category,
    representativeDomain: row.representative_domain || 'Unknown',
    taxonomicDiversity: row.taxonomic_diversity || 0,
    structuralDiversity: row.structural_diversity || undefined,
    t_group: row.t_group,
    t_group_name: row.t_group_name,
    cluster_number: row.cluster_number,
    cluster_set_id: row.cluster_set_id,
    requires_new_classification: row.requires_new_classification
  }));

  const totals = countResult.rows[0] || {
    unclassified: 0,
    flagged: 0,
    reclassification: 0,
    diverse: 0,
    all: 0
  };

  return {
    clusters,
    totals
  };
}