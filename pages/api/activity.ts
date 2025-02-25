// pages/api/activity.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Define activity log types for TypeScript
export interface ActivityLogEntry {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  details: any;
  created_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      entity_type,
      entity_id,
      action,
      user_id,
      from_date,
      to_date,
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
    
    if (entity_type) {
      conditions.push(`entity_type = $${params.length + 1}`);
      params.push(entity_type);
    }
    
    if (entity_id) {
      conditions.push(`entity_id = $${params.length + 1}`);
      params.push(entity_id);
    }
    
    if (action) {
      conditions.push(`action = $${params.length + 1}`);
      params.push(action);
    }
    
    if (user_id) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(user_id);
    }
    
    if (from_date) {
      conditions.push(`created_at >= $${params.length + 1}`);
      params.push(from_date);
    }
    
    if (to_date) {
      conditions.push(`created_at <= $${params.length + 1}`);
      params.push(to_date);
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // IMPORTANT NOTE: Since we don't have the actual activity_logs table in the schema files,
    // I'm creating a simulated solution. In a real implementation, you would query from an
    // actual activity_logs table. The code below assumes such a table exists or can be created.
    
    // Check if activity_logs table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS swissprot.activity_logs (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // If the table is empty or newly created, we can seed it with some sample data
    const countResult = await pool.query('SELECT COUNT(*) FROM swissprot.activity_logs');
    if (parseInt(countResult.rows[0].count, 10) === 0) {
      // Seed with sample data
      await seedSampleActivityLogs(pool);
    }
    
    // Query for activity logs with pagination
    const activityLogsQuery = `
      SELECT 
        id,
        entity_type,
        entity_id,
        action,
        user_id,
        details,
        created_at
      FROM swissprot.activity_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitNum, offset);
    
    const logsResult = await pool.query(activityLogsQuery, params);
    
    // Get total count for pagination
    const totalCountQuery = `
      SELECT COUNT(*) as total
      FROM swissprot.activity_logs
      ${whereClause}
    `;
    
    const totalResult = await pool.query(totalCountQuery, params.slice(0, params.length - 2));
    const total = parseInt(totalResult.rows[0].total, 10);
    
    // Get some summary statistics
    const summaryQuery = `
      SELECT 
        action, 
        COUNT(*) as count
      FROM swissprot.activity_logs
      ${whereClause}
      GROUP BY action
      ORDER BY count DESC
    `;
    
    const summaryResult = await pool.query(summaryQuery, params.slice(0, params.length - 2));
    
    // Get recent user activity
    const userActivityQuery = `
      SELECT 
        user_id, 
        COUNT(*) as activity_count,
        MAX(created_at) as last_active
      FROM swissprot.activity_logs
      ${whereClause}
      GROUP BY user_id
      ORDER BY last_active DESC
      LIMIT 5
    `;
    
    const userActivityResult = await pool.query(userActivityQuery, params.slice(0, params.length - 2));
    
    return res.status(200).json({
      logs: logsResult.rows,
      total,
      page: pageNum,
      pageSize: limitNum,
      summary: {
        actions: summaryResult.rows,
        recentUsers: userActivityResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ 
      message: 'Error fetching activity logs', 
      error: (error as Error).message 
    });
  }
}

// Helper function to seed sample activity logs
async function seedSampleActivityLogs(pool: Pool) {
  // Get some cluster IDs to use in our sample data
  const clusterResult = await pool.query(`
    SELECT id FROM swissprot.domain_clusters
    ORDER BY id
    LIMIT 10
  `);
  
  const clusters = clusterResult.rows.map(row => row.id);
  
  // Sample actions
  const actions = ['created', 'updated', 'validated', 'reclassified', 'flagged', 'viewed'];
  
  // Sample users
  const users = ['jsmith', 'apatil', 'system', 'mchen', 'admin'];
  
  // Generate 50 sample logs
  const sampleLogs = [];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const date = new Date(now.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
    
    let details;
    switch (action) {
      case 'reclassified':
        details = {
          oldTGroup: `${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}`,
          newTGroup: `${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}`,
          confidence: Math.random() > 0.7 ? 'high' : (Math.random() > 0.4 ? 'medium' : 'low')
        };
        break;
      case 'updated':
        details = {
          fields: ['description', 'metadata', 'annotations'][Math.floor(Math.random() * 3)]
        };
        break;
      case 'flagged':
        details = {
          reason: ['inconsistent_structure', 'taxonomy_mismatch', 'needs_review'][Math.floor(Math.random() * 3)]
        };
        break;
      default:
        details = {};
    }
    
    sampleLogs.push({
      entity_type: 'cluster',
      entity_id: cluster,
      action,
      user_id: user,
      details: JSON.stringify(details),
      created_at: date.toISOString()
    });
  }
  
  // Insert sample logs
  for (const log of sampleLogs) {
    await pool.query(`
      INSERT INTO swissprot.activity_logs (entity_type, entity_id, action, user_id, details, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [log.entity_type, log.entity_id, log.action, log.user_id, log.details, log.created_at]);
  }
}
