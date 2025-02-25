// pages/api/dashboard/reclassifications.ts
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
    // Get clusters pending reclassification
    const reclassResult = await pool.query(`
      SELECT 
        dc.id::text,
        'Cluster-' || dc.cluster_number as name,
        d.t_group as current_t_group,
        CASE
          WHEN ca.analysis_notes LIKE '%suggest%' THEN 
            SUBSTRING(ca.analysis_notes FROM 'suggest[^0-9]*([0-9]+\\.[0-9]+\\.[0-9]+)')
          ELSE 'unknown'
        END as proposed_t_group,
        CASE
          WHEN ca.structure_consistency > 0.7 THEN 'high'
          WHEN ca.structure_consistency > 0.4 THEN 'medium'
          ELSE 'low'
        END as confidence
      FROM swissprot.domain_clusters dc
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id AND dcm.is_representative = true
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      WHERE ca.requires_new_classification = true
      ORDER BY ca.structure_consistency DESC
      LIMIT 3
    `);
    
    return res.status(200).json(reclassResult.rows);
  } catch (error) {
    console.error('Error fetching reclassifications data:', error);
    return res.status(500).json({ 
      message: 'Error fetching reclassifications data', 
      error: (error as Error).message 
    });
  }
}