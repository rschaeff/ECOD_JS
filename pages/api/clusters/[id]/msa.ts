// pages/api/clusters/[id]/msa.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { MSAData } from '@/services/api';

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
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get most recent MSA data for this cluster
    const msaResult = await pool.query(`
      SELECT 
        id, batch_id, cluster_id, alignment_length, num_sequences,
        avg_identity, avg_coverage, alignment_data, 
        conserved_positions, gap_positions
      FROM swissprot.domain_msa
      WHERE cluster_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [id]);
    
    if (msaResult.rows.length === 0) {
      return res.status(404).json({ message: 'MSA data not found for this cluster' });
    }
    
    const msaData: MSAData = msaResult.rows[0];
    
    return res.status(200).json(msaData);
  } catch (error) {
    console.error('Error fetching MSA data:', error);
    return res.status(500).json({ message: 'Error fetching MSA data', error: (error as Error).message });
  }
}
