// pages/api/clusters/[id]/members.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { ClusterMember } from '@/services/api';

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
  const { page = '1', limit = '20' } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the cluster exists
    const clusterResult = await pool.query(`
      SELECT id 
      FROM swissprot.domain_clusters 
      WHERE id = $1
    `, [id]);
    
    if (clusterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cluster not found' });
    }
    
    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get cluster members with pagination
    const membersQuery = `
      SELECT 
        dcm.id, 
        dcm.cluster_id, 
        dcm.domain_id, 
        dcm.sequence_identity, 
        dcm.alignment_coverage, 
        dcm.is_representative,
        d.unp_acc, 
        d.domain_id as domain_identifier, 
        d.range, 
        d.t_group,
        t.scientific_name as species,
        tn.name as t_group_name
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      LEFT JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      WHERE dcm.cluster_id = $1
      ORDER BY dcm.is_representative DESC, dcm.sequence_identity DESC
      LIMIT $2 OFFSET $3
    `;
    
    const membersResult = await pool.query(membersQuery, [id, limitNum, offset]);
    
    // Transform members to include domain as a nested object
    const members = membersResult.rows.map(row => ({
      id: row.id,
      cluster_id: row.cluster_id,
      domain_id: row.domain_id,
      sequence_identity: row.sequence_identity,
      alignment_coverage: row.alignment_coverage,
      is_representative: row.is_representative,
      domain: {
        id: row.domain_id,
        unp_acc: row.unp_acc,
        domain_id: row.domain_identifier,
        range: row.range,
        t_group: row.t_group,
        t_group_name: row.t_group_name
      },
      species: row.species
    }));
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM swissprot.domain_cluster_members
      WHERE cluster_id = $1
    `;
    
    const countResult = await pool.query(countQuery, [id]);
    const total = parseInt(countResult.rows[0].total, 10);
    
    return res.status(200).json({
      members,
      total,
      page: pageNum,
      pageSize: limitNum
    });
  } catch (error) {
    console.error(`Error fetching members for cluster ${id}:`, error);
    return res.status(500).json({ 
      message: `Error fetching members for cluster ${id}`, 
      error: (error as Error).message 
    });
  }
}
