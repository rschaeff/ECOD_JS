// pages/api/classification.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

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
    // Get domain classification status distribution
    const statusDistributionQuery = `
      WITH classification_status AS (
        SELECT
          CASE
            WHEN ca.requires_new_classification THEN 'Needs Review'
            WHEN ca.structure_consistency >= 0.8 THEN 'Validated'
            WHEN ca.structure_consistency >= 0.5 THEN 'Acceptable'
            ELSE 'Uncertain'
          END as status,
          COUNT(*) as count
        FROM swissprot.domain_clusters dc
        LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
        GROUP BY status
      ),
      total AS (
        SELECT SUM(count) as total_count
        FROM classification_status
      )
      SELECT 
        cs.status,
        cs.count,
        ROUND((cs.count::float / t.total_count) * 100, 1) as percentage
      FROM classification_status cs
      CROSS JOIN total t
      ORDER BY
        CASE cs.status
          WHEN 'Validated' THEN 1
          WHEN 'Acceptable' THEN 2
          WHEN 'Uncertain' THEN 3
          WHEN 'Needs Review' THEN 4
          ELSE 5
        END
    `;
    
    const statusDistributionResult = await pool.query(statusDistributionQuery);
    const statusDistribution = statusDistributionResult.rows;
    
    // Get T-group consistency data
    const tgroupConsistencyQuery = `
      WITH cluster_tgroup_counts AS (
        SELECT
          dc.id as cluster_id,
          d.t_group,
          COUNT(*) as count,
          (SELECT COUNT(*) FROM swissprot.domain_cluster_members WHERE cluster_id = dc.id) as total
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        GROUP BY dc.id, d.t_group
      ),
      tgroup_names_data AS (
        SELECT
          tc.t_group,
          COALESCE(tn.name, tc.t_group) as name,
          SUM(tc.count) as domain_count,
          AVG(tc.count::float / NULLIF(tc.total, 0)) as avg_consistency
        FROM cluster_tgroup_counts tc
        LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = tc.t_group
        GROUP BY tc.t_group, COALESCE(tn.name, tc.t_group)
        HAVING COUNT(*) > 5
      )
      SELECT
        name,
        ROUND(avg_consistency * 100, 1) as value
      FROM tgroup_names_data
      ORDER BY avg_consistency DESC
      LIMIT 10
    `;
    
    const tgroupConsistencyResult = await pool.query(tgroupConsistencyQuery);
    const tgroupConsistency = tgroupConsistencyResult.rows;
    
    // Get classification comparison data across cluster sets
    const comparisonDataQuery = `
      WITH cluster_set_stats AS (
        SELECT
          dcs.name,
          SUM(CASE WHEN ca.structure_consistency >= 0.8 THEN 1 ELSE 0 END) as validated,
          SUM(CASE WHEN ca.requires_new_classification THEN 1 ELSE 0 END) as needs_review,
          SUM(CASE WHEN ca.structure_consistency < 0.5 AND NOT ca.requires_new_classification THEN 1 ELSE 0 END) as conflicts,
          SUM(CASE WHEN ca.id IS NULL THEN 1 ELSE 0 END) as unclassified
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
        LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
        GROUP BY dcs.name
        ORDER BY dcs.name
      )
      SELECT * FROM cluster_set_stats
    `;
    
    const comparisonDataResult = await pool.query(comparisonDataQuery);
    const comparisonData = comparisonDataResult.rows;
    
    return res.status(200).json({
      statusDistribution,
      tgroupConsistency,
      comparisonData
    });
  } catch (error) {
    console.error('Error fetching classification data:', error);
    return res.status(500).json({ 
      message: 'Error fetching classification data', 
      error: (error as Error).message 
    });
  }
}