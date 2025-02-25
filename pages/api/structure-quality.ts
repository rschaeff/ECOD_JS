// pages/api/structure-quality.ts
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
    // Get quality metrics data by joining domain_structure with other tables
    const qualityMetricsQuery = `
      WITH cluster_data AS (
        SELECT 
          dc.id as cluster_id,
          dcs.name as cluster_set,
          dc.cluster_set_id,
          COUNT(dcm.domain_id) as cluster_size,
          ca.structure_consistency,
          ca.experimental_support_ratio,
          ca.taxonomic_diversity
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
        JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
        LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
        GROUP BY dc.id, dcs.name, dc.cluster_set_id, ca.structure_consistency, ca.experimental_support_ratio, ca.taxonomic_diversity
      ),
      tgroup_counts AS (
        SELECT 
          dcm.cluster_id,
          d.t_group,
          COUNT(*) as count
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        GROUP BY dcm.cluster_id, d.t_group
      ),
      max_tgroup_counts AS (
        SELECT 
          cluster_id,
          MAX(count) as max_count,
          SUM(count) as total
        FROM tgroup_counts
        GROUP BY cluster_id
      ),
      tgroup_homogeneity AS (
        SELECT
          tc.cluster_id,
          COALESCE(mtc.max_count::float / NULLIF(mtc.total, 0), 0) as tgroup_homogeneity
        FROM tgroup_counts tc
        JOIN max_tgroup_counts mtc ON tc.cluster_id = mtc.cluster_id AND tc.count = mtc.max_count
      ),
      structure_metrics AS (
        SELECT
          ds.domain_id,
          AVG(COALESCE(ds.mean_plddt, 70)) as avg_plddt,
          ds.source
        FROM swissprot.domain_structure ds
        GROUP BY ds.domain_id, ds.source
      )
      SELECT
        cd.cluster_size,
        cd.structure_consistency,
        cd.experimental_support_ratio,
        th.tgroup_homogeneity,
        ROUND(AVG(sm.avg_plddt)::numeric, 2) as plddt,
        cd.cluster_set,
        sm.source
      FROM cluster_data cd
      LEFT JOIN tgroup_homogeneity th ON cd.cluster_id = th.cluster_id
      LEFT JOIN swissprot.domain_cluster_members dcm ON cd.cluster_id = dcm.cluster_id
      LEFT JOIN structure_metrics sm ON dcm.domain_id = sm.domain_id
      WHERE cd.structure_consistency IS NOT NULL
      GROUP BY cd.cluster_size, cd.structure_consistency, cd.experimental_support_ratio, th.tgroup_homogeneity, cd.cluster_set, sm.source
      ORDER BY cd.cluster_set_id
      LIMIT 1000
    `;
    
    const qualityMetricsResult = await pool.query(qualityMetricsQuery);
    const qualityMetrics = qualityMetricsResult.rows;
    
    // Get average metrics by cluster set
    const clusterSetAveragesQuery = `
      WITH cluster_metrics AS (
        SELECT 
          dc.cluster_set_id,
          dcs.name,
          AVG(COALESCE(ca.structure_consistency, 0)) as avg_structure_consistency,
          AVG(COALESCE(ca.experimental_support_ratio, 0)) as avg_experimental_support
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
        LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
        GROUP BY dc.cluster_set_id, dcs.name
      ),
      domain_plddt AS (
        SELECT
          dc.cluster_set_id,
          AVG(COALESCE(dpd.average_plddt, 70)) as avg_plddt
        FROM swissprot.domain_clusters dc
        JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
        LEFT JOIN swissprot.domain_plddt_detail dpd ON dcm.domain_id = dpd.domain_id
        GROUP BY dc.cluster_set_id
      ),
      tgroup_homogeneity AS (
        SELECT
          dc.cluster_set_id,
          AVG(
            (SELECT COUNT(*) FROM swissprot.domain_cluster_members dcm2
             JOIN swissprot.domain d2 ON dcm2.domain_id = d2.id
             WHERE dcm2.cluster_id = dc.id AND d2.t_group = 
                (SELECT d3.t_group FROM swissprot.domain_cluster_members dcm3
                 JOIN swissprot.domain d3 ON dcm3.domain_id = d3.id
                 WHERE dcm3.cluster_id = dc.id
                 GROUP BY d3.t_group ORDER BY COUNT(*) DESC LIMIT 1)
            )::float / 
            NULLIF((SELECT COUNT(*) FROM swissprot.domain_cluster_members dcm4
                   WHERE dcm4.cluster_id = dc.id), 0)
          ) as avg_tgroup_homogeneity
        FROM swissprot.domain_clusters dc
        GROUP BY dc.cluster_set_id
      )
      SELECT
        cm.name,
        ROUND(cm.avg_structure_consistency::numeric, 2) as avg_structure_consistency,
        ROUND(cm.avg_experimental_support::numeric, 2) as avg_experimental_support,
        ROUND(dp.avg_plddt::numeric, 2) as avg_plddt,
        ROUND(th.avg_tgroup_homogeneity::numeric, 2) as avg_tgroup_homogeneity
      FROM cluster_metrics cm
      LEFT JOIN domain_plddt dp ON cm.cluster_set_id = dp.cluster_set_id
      LEFT JOIN tgroup_homogeneity th ON cm.cluster_set_id = th.cluster_set_id
      ORDER BY cm.name
    `;
    
    const clusterSetAveragesResult = await pool.query(clusterSetAveragesQuery);
    const clusterSetAverages = clusterSetAveragesResult.rows;
    
    return res.status(200).json({
      qualityMetrics,
      clusterSetAverages
    });
  } catch (error) {
    console.error('Error fetching structure quality data:', error);
    return res.status(500).json({ 
      message: 'Error fetching structure quality data', 
      error: (error as Error).message 
    });
  }
}