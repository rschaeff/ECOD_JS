// pages/api/reclassifications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Define reclassification types for TypeScript
export interface Reclassification {
  id: string;
  cluster_id: number;
  cluster_number: number;
  cluster_set_name: string;
  current_t_group: string;
  current_t_group_name: string | null;
  proposed_t_group: string;
  proposed_t_group_name: string | null;
  confidence: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  representative_domain: string;
  taxonomic_diversity: number | null;
  structure_consistency: number | null;
  analysis_notes: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGetReclassifications(req, res);
  } else if (req.method === 'POST') {
    return handleUpdateReclassificationStatus(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Handler for GET requests to fetch reclassifications
async function handleGetReclassifications(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { 
      status = 'pending',
      confidence,
      cluster_set_id,
      page = '1', 
      limit = '20' 
    } = req.query;
    
    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build the WHERE clause for filtering
    const conditions = [];
    const params = [];
    
    // We're using the requires_new_classification field in cluster_analysis
    // to identify clusters that need reclassification
    conditions.push(`ca.requires_new_classification = true`);
    
    if (status && status !== 'all') {
      // In a production system, you would have a reclassification_status column
      // For now, since we only have requires_new_classification, we'll simulate:
      if (status === 'pending') {
        // If there's no approved/rejected status field, all flagged clusters are "pending"
        conditions.push(`true`);
      } else if (status === 'approved' || status === 'rejected') {
        // This is a placeholder - in practice you'd have:
        // conditions.push(`status = $${params.length + 1}`);
        // params.push(status);
        conditions.push(`false`); // No approved/rejected items for demo purpose
      }
    }
    
    if (confidence) {
      // Use structure_consistency to approximate confidence
      if (confidence === 'high') {
        conditions.push(`ca.structure_consistency >= 0.7`);
      } else if (confidence === 'medium') {
        conditions.push(`ca.structure_consistency >= 0.4 AND ca.structure_consistency < 0.7`);
      } else if (confidence === 'low') {
        conditions.push(`ca.structure_consistency < 0.4`);
      }
    }
    
    if (cluster_set_id) {
      conditions.push(`dc.cluster_set_id = $${params.length + 1}`);
      params.push(cluster_set_id);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Query for reclassifications with pagination
    const reclassificationsQuery = `
      SELECT 
        dc.id::text,
        dc.id as cluster_id,
        dc.cluster_number,
        dcs.name as cluster_set_name,
        d.t_group as current_t_group,
        tn_current.name as current_t_group_name,
        CASE
          WHEN ca.analysis_notes LIKE '%suggest%' THEN 
            SUBSTRING(ca.analysis_notes FROM 'suggest[^0-9]*([0-9]+\\.[0-9]+\\.[0-9]+)')
          ELSE 'unknown'
        END as proposed_t_group,
        tn_proposed.name as proposed_t_group_name,
        CASE
          WHEN ca.structure_consistency > 0.7 THEN 'high'
          WHEN ca.structure_consistency > 0.4 THEN 'medium'
          ELSE 'low'
        END as confidence,
        'pending'::text as status,  -- In production, get actual status from a status table
        NULL as reviewed_by,  -- In production, get from status table
        NULL as reviewed_at,  -- In production, get from status table
        ca.created_at,
        d.domain_id as representative_domain,
        ca.taxonomic_diversity,
        ca.structure_consistency,
        ca.analysis_notes
      FROM swissprot.domain_clusters dc
      JOIN swissprot.domain_cluster_sets dcs ON dc.cluster_set_id = dcs.id
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id AND dcm.is_representative = true
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.tgroup_names tn_current ON tn_current.tgroup_id = d.t_group
      LEFT JOIN swissprot.tgroup_names tn_proposed ON tn_proposed.tgroup_id = (
        CASE
          WHEN ca.analysis_notes LIKE '%suggest%' THEN 
            SUBSTRING(ca.analysis_notes FROM 'suggest[^0-9]*([0-9]+\\.[0-9]+\\.[0-9]+)')
          ELSE NULL
        END
      )
      ${whereClause}
      ORDER BY ca.structure_consistency DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitNum, offset);
    
    const reclassificationsResult = await pool.query(reclassificationsQuery, params);
    
    // Get total count for pagination
    const totalCountQuery = `
      SELECT COUNT(*) as total
      FROM swissprot.domain_clusters dc
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      ${whereClause}
    `;
    
    const totalResult = await pool.query(totalCountQuery, params.slice(0, params.length - 2));
    const total = parseInt(totalResult.rows[0].total, 10);
    
    // Get summary stats
    const summaryQuery = `
      SELECT 
        CASE
          WHEN ca.structure_consistency > 0.7 THEN 'high'
          WHEN ca.structure_consistency > 0.4 THEN 'medium'
          ELSE 'low'
        END as confidence,
        COUNT(*) as count
      FROM swissprot.domain_clusters dc
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      WHERE ca.requires_new_classification = true
      GROUP BY confidence
      ORDER BY 
        CASE confidence
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END
    `;
    
    const summaryResult = await pool.query(summaryQuery);
    
    // Get topology group distribution
    const tgroupQuery = `
      SELECT 
        d.t_group,
        COALESCE(tn.name, d.t_group) as name,
        COUNT(*) as count
      FROM swissprot.domain_clusters dc
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      JOIN swissprot.domain_cluster_members dcm ON dc.id = dcm.cluster_id AND dcm.is_representative = true
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      WHERE ca.requires_new_classification = true
      GROUP BY d.t_group, COALESCE(tn.name, d.t_group)
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const tgroupResult = await pool.query(tgroupQuery);
    
    return res.status(200).json({
      reclassifications: reclassificationsResult.rows,
      total,
      page: pageNum,
      pageSize: limitNum,
      summary: {
        byConfidence: summaryResult.rows,
        byTGroup: tgroupResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching reclassifications:', error);
    return res.status(500).json({ 
      message: 'Error fetching reclassifications', 
      error: (error as Error).message 
    });
  }
}

// Handler for POST requests to update reclassification status
async function handleUpdateReclassificationStatus(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { cluster_id, status, user_id, notes, new_t_group } = req.body;
    
    if (!cluster_id || !status || !user_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: cluster_id, status, and user_id are required' 
      });
    }
    
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ 
        message: 'Invalid status value. Must be either "approved" or "rejected"' 
      });
    }
    
    // In a complete implementation, you would:
    // 1. Check if the cluster exists and requires reclassification
    // 2. Update a reclassification_status table
    // 3. If approved, update the domain's t_group
    // 4. Record the action in activity logs
    
    // For now, we'll implement a simplified version:
    
    // Check if cluster exists and requires reclassification
    const clusterCheckQuery = `
      SELECT 
        dc.id, 
        ca.requires_new_classification
      FROM swissprot.domain_clusters dc
      JOIN swissprot.cluster_analysis ca ON dc.id = ca.cluster_id
      WHERE dc.id = $1
    `;
    
    const clusterResult = await pool.query(clusterCheckQuery, [cluster_id]);
    
    if (clusterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cluster not found' });
    }
    
    if (!clusterResult.rows[0].requires_new_classification) {
      return res.status(400).json({ 
        message: 'This cluster does not require reclassification' 
      });
    }
    
    // If approved and new_t_group is provided, we would update the representative domain's t_group
    if (status === 'approved' && new_t_group) {
      // Get the representative domain
      const representativeQuery = `
        SELECT d.id, d.domain_id
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        WHERE dcm.cluster_id = $1 AND dcm.is_representative = true
      `;
      
      const representativeResult = await pool.query(representativeQuery, [cluster_id]);
      
      if (representativeResult.rows.length > 0) {
        const domainId = representativeResult.rows[0].id;
        
        // Update the domain's t_group
        await pool.query(`
          UPDATE swissprot.domain
          SET t_group = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [new_t_group, domainId]);
      }
    }
    
    // Update the cluster_analysis record
    await pool.query(`
      UPDATE swissprot.cluster_analysis
      SET 
        requires_new_classification = $1,
        analysis_notes = CASE 
          WHEN $2 IS NOT NULL THEN $2
          ELSE analysis_notes
        END
      WHERE cluster_id = $3
    `, [status !== 'approved', notes, cluster_id]);
    
    // In a complete implementation, you would also:
    // 1. Insert a record into a reclassification_status table
    // 2. Add an entry to the activity_logs table
    
    // Return success response
    return res.status(200).json({
      message: `Reclassification ${status}`,
      cluster_id,
      status,
      user_id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating reclassification status:', error);
    return res.status(500).json({ 
      message: 'Error updating reclassification status', 
      error: (error as Error).message 
    });
  }
}
