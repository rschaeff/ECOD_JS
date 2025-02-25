// pages/api/clustersets/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { ClusterSet } from '@/services/api';

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
    // Get all cluster sets with additional statistics
    const clusterSetsQuery = `
      SELECT 
        dcs.id,
        dcs.name,
        dcs.method,
        dcs.sequence_identity,
        dcs.description,
        dcs.created_at,
        (SELECT COUNT(*) FROM swissprot.domain_clusters WHERE cluster_set_id = dcs.id) as clusters_count,
        (
          SELECT COUNT(*)
          FROM swissprot.domain_clusters dc
          JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
          WHERE dc.cluster_set_id = dcs.id
        ) as domains_count,
        COALESCE(
          (
            SELECT AVG(ca.taxonomic_diversity)
            FROM swissprot.domain_clusters dc
            JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
            WHERE dc.cluster_set_id = dcs.id
          ),
          0.5
        ) as taxonomic_coverage,
        (
          SELECT COUNT(*)
          FROM swissprot.domain_clusters dc
          JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
          WHERE dc.cluster_set_id = dcs.id AND ca.requires_new_classification = true
        ) as flagged_clusters
      FROM swissprot.domain_cluster_sets dcs
      ORDER BY dcs.sequence_identity DESC
    `;
    
    const clusterSetsResult = await pool.query(clusterSetsQuery);
    const clusterSets: ClusterSet[] = clusterSetsResult.rows;
    
    return res.status(200).json(clusterSets);
  } catch (error) {
    console.error('Error fetching cluster sets:', error);
    return res.status(500).json({ 
      message: 'Error fetching cluster sets', 
      error: (error as Error).message 
    });
  }
}
