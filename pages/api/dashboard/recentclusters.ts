// pages/api/dashboard/recentclusters.ts
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
    // Get recent clusters
    const recentClustersResult = await pool.query(`
      SELECT 
        dc.id::text,
        'Cluster-' || dc.cluster_number as name,
        (SELECT COUNT(*) FROM swissprot.domain_cluster_members WHERE cluster_id = dc.id) as size,
        COALESCE(ca.taxonomic_diversity, 0.5) as taxonomic_diversity,
        d.domain_id as representative_domain
      FROM swissprot.domain_clusters dc
      LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      LEFT JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id AND dcm.is_representative = true
      LEFT JOIN swissprot.domain d ON dcm.domain_id = d.id
      ORDER BY dc.created_at DESC
      LIMIT 4
    `);
    
    return res.status(200).json(recentClustersResult.rows);
  } catch (error) {
    console.error('Error fetching recent clusters data:', error);
    return res.status(500).json({ 
      message: 'Error fetching recent clusters data', 
      error: (error as Error).message 
    });
  }
}