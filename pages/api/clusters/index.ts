// pages/api/clusters/index.ts
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
    const { clusterset_id, t_group, tax_id, page = '1', limit = '20' } = req.query;
    
    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build the WHERE clause based on filters
    let whereClause = '';
    const params: any[] = [];
    
    if (clusterset_id) {
      whereClause += ' AND dc.cluster_set_id = $' + (params.length + 1);
      params.push(clusterset_id);
    }
    
    if (t_group) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        WHERE dcm.cluster_id = dc.id AND d.t_group = $${params.length + 1}
      )`;
      params.push(t_group);
    }
    
    if (tax_id) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
        WHERE dcm.cluster_id = dc.id AND pt.tax_id = $${params.length + 1}
      )`;
      params.push(tax_id);
    }
    
    // Query for clusters with pagination
    const clustersQuery = `
      SELECT 
        dc.id, 
        dc.cluster_number,
        dc.cluster_set_id,
        dcs.name as cluster_set_name,
        dcs.sequence_identity,
        (SELECT COUNT(*) FROM swissprot.domain_cluster_members WHERE cluster_id = dc.id) as size,
        COALESCE(ca.taxonomic_diversity, 0) as taxonomic_diversity,
        COALESCE(ca.structure_consistency, 0) as structure_consistency,
        COALESCE(ca.requires_new_classification, false) as requires_new_classification
      FROM swissprot.domain_clusters dc
      JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
      LEFT JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      WHERE 1=1 ${whereClause}
      ORDER BY dc.cluster_number DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitNum, offset);
    
    const clustersResult = await pool.query(clustersQuery, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM swissprot.domain_clusters dc
      WHERE 1=1 ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].total, 10);
    
    return res.status(200).json({
      clusters: clustersResult.rows,
      total,
      page: pageNum,
      pageSize: limitNum
    });
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return res.status(500).json({ message: 'Error fetching clusters', error: (error as Error).message });
  }
}
