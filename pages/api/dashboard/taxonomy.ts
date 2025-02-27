// pages/api/dashboard/taxonomy.ts
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
    // Get taxonomy stats (fixed query) this query doesn't report anything useful
    // A better query would return the fraction of monophyletic versus multiphyletic versus singleton clusters
    const taxonomyStatsResult = await pool.query(`
      SELECT 
        superkingdom as kingdom,
        COUNT(DISTINCT domain_id) as domains,
        COUNT(DISTINCT cluster_id) as clusters
      FROM (
        SELECT 
          dcm.domain_id,
          dcm.cluster_id,
          swissprot.get_ancestor_name(pt.tax_id, 'superkingdom') as superkingdom
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
        LIMIT 1000000  -- Limit to prevent timeout with large datasets
      ) as taxonomy_data
      WHERE superkingdom IS NOT NULL
      GROUP BY superkingdom
      ORDER BY domains DESC
    `);
    
    // Get T-group distribution
    // This query is just as useless as the one above
    const tgroupResult = await pool.query(`
      SELECT 
        COALESCE(tn.name, d.t_group) as tgroup,
        COUNT(DISTINCT dcm.cluster_id) as count
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      GROUP BY COALESCE(tn.name, d.t_group)
      ORDER BY count DESC
      LIMIT 6
    `);
    
    return res.status(200).json({
      taxonomyStats: taxonomyStatsResult.rows,
      tgroupDistribution: tgroupResult.rows
    });
  } catch (error) {
    console.error('Error fetching taxonomy data:', error);
    return res.status(500).json({ 
      message: 'Error fetching taxonomy data', 
      error: (error as Error).message 
    });
  }
}