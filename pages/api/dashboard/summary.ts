// pages/api/dashboard/summary.ts
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
    // Get counts for summary cards only
    const countsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM swissprot.domain_clusters) as total_clusters,
        (SELECT COUNT(*) FROM swissprot.domain) as total_domains,
        (SELECT COUNT(*) FROM swissprot.cluster_analysis WHERE requires_new_classification = true) as needs_review
    `);
    
    const counts = countsResult.rows[0];
    
    return res.status(200).json({
      totalClusters: parseInt(counts.total_clusters, 10),
      totalDomains: parseInt(counts.total_domains, 10),
      needsReview: parseInt(counts.needs_review, 10)
    });
  } catch (error) {
    console.error('Error fetching summary data:', error);
    return res.status(500).json({ 
      message: 'Error fetching summary data', 
      error: (error as Error).message 
    });
  }
}