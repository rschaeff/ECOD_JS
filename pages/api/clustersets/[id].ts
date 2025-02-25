// pages/api/clustersets/[id].ts
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
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get details for a specific cluster set with additional statistics
    const clusterSetQuery = `
      SELECT 
        dcs.id,
        dcs.name,
        dcs.method,
        dcs.sequence_identity,
        dcs.band_width,
        dcs.word_length,
        dcs.min_length,
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
        ) as flagged_clusters,
        (
          SELECT MAX(dc.cluster_number)
          FROM swissprot.domain_clusters dc
          WHERE dc.cluster_set_id = dcs.id
        ) as max_cluster_number,
        (
          SELECT ROUND(AVG(member_count), 2)
          FROM (
            SELECT COUNT(*) as member_count
            FROM swissprot.domain_clusters dc
            JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
            WHERE dc.cluster_set_id = dcs.id
            GROUP BY dc.id
          ) as cluster_sizes
        ) as avg_cluster_size
      FROM swissprot.domain_cluster_sets dcs
      WHERE dcs.id = $1
    `;
    
    const clusterSetResult = await pool.query(clusterSetQuery, [id]);
    
    if (clusterSetResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cluster set not found' });
    }
    
    const clusterSet: ClusterSet = clusterSetResult.rows[0];
    
    // Get distribution of cluster sizes
    const sizeDistributionQuery = `
      WITH cluster_sizes AS (
        SELECT 
          dc.id,
          COUNT(*) as size
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
        WHERE dc.cluster_set_id = $1
        GROUP BY dc.id
      ),
      size_ranges AS (
        SELECT
          CASE
            WHEN size = 1 THEN 'Singletons'
            WHEN size BETWEEN 2 AND 5 THEN '2-5'
            WHEN size BETWEEN 6 AND 10 THEN '6-10'
            WHEN size BETWEEN 11 AND 20 THEN '11-20'
            WHEN size BETWEEN 21 AND 50 THEN '21-50'
            WHEN size BETWEEN 51 AND 100 THEN '51-100'
            ELSE '100+'
          END as range,
          COUNT(*) as count
        FROM cluster_sizes
        GROUP BY range
        ORDER BY 
          CASE range
            WHEN 'Singletons' THEN 1
            WHEN '2-5' THEN 2
            WHEN '6-10' THEN 3
            WHEN '11-20' THEN 4
            WHEN '21-50' THEN 5
            WHEN '51-100' THEN 6
            ELSE 7
          END
      )
      SELECT * FROM size_ranges
    `;
    
    const sizeDistributionResult = await pool.query(sizeDistributionQuery, [id]);
    const sizeDistribution = sizeDistributionResult.rows;
    
    // Get T-group distribution
    const tGroupDistributionQuery = `
      SELECT 
        d.t_group, 
        COALESCE(tn.name, d.t_group) as name,
        COUNT(DISTINCT dc.id) as cluster_count,
        COUNT(*) as domain_count
      FROM swissprot.domain_clusters dc
      JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      WHERE dc.cluster_set_id = $1
      GROUP BY d.t_group, COALESCE(tn.name, d.t_group)
      ORDER BY domain_count DESC
      LIMIT 10
    `;
    
    const tGroupDistributionResult = await pool.query(tGroupDistributionQuery, [id]);
    const tGroupDistribution = tGroupDistributionResult.rows;
    
    // Return enhanced cluster set data
    return res.status(200).json({
      ...clusterSet,
      sizeDistribution,
      tGroupDistribution
    });
  } catch (error) {
    console.error(`Error fetching cluster set ${id}:`, error);
    return res.status(500).json({ 
      message: `Error fetching cluster set ${id}`, 
      error: (error as Error).message 
    });
  }
}
