// pages/api/dashboard/clustersets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

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
    // Get cluster sets with stats
    const clusterSetsResult = await pool.query(`
      SELECT 
        dcs.id,
        dcs.name,
        (SELECT COUNT(*) FROM swissprot.domain_clusters WHERE cluster_set_id = dcs.id) as clusters,
        (
          SELECT COUNT(*)
          FROM swissprot.domain_clusters dc
          JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id
          WHERE dc.cluster_set_id = dcs.id
        ) as domains,
        COALESCE(
          (
            SELECT AVG(ca.taxonomic_diversity)
            FROM swissprot.domain_clusters dc
            JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
            WHERE dc.cluster_set_id = dcs.id
          ),
          0.5
        ) as taxonomic_coverage
      FROM swissprot.domain_cluster_sets dcs
      ORDER BY dcs.sequence_identity DESC
    `);
    
    return res.status(200).json(clusterSetsResult.rows);
  } catch (error) {
    console.error('Error fetching cluster sets data:', error);
    return res.status(500).json({ 
      message: 'Error fetching cluster sets data', 
      error: (error as Error).message 
    });
  }
}