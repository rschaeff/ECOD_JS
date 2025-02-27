// pages/api/domains/[id]/structure.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { DomainStructure } from '@/types';

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
    // Verify the domain exists
    const domainResult = await pool.query(`
      SELECT id, domain_id, unp_acc, t_group 
      FROM swissprot.domain 
      WHERE id = $1
    `, [id]);
    
    if (domainResult.rows.length === 0) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Get the most recent structure for this domain
    const structureQuery = `
      SELECT 
        ds.id,
        ds.domain_id,
        ds.file_path,
        ds.file_type,
        ds.source,
        ds.extraction_method,
        ds.extraction_date,
        ds.resolution,
        ds.mean_plddt,
        ds.clash_score,
        ds.ramachandran_outliers,
        ds.sidechain_outliers,
        ds.best_experimental_hit_pdb,
        ds.best_hit_tm_score,
        ds.best_hit_rmsd,
        ds.best_hit_seq_identity,
        ds.experimental_validation_date,
        ds.file_hash,
        ds.file_size,
        ds.last_verified,
        ds.created_by,
        ds.created_at,
        ds.updated_at,
        ds.notes
      FROM swissprot.domain_structure ds
      WHERE ds.domain_id = $1
      ORDER BY ds.updated_at DESC
      LIMIT 1
    `;
    
    const structureResult = await pool.query(structureQuery, [id]);
    
    // If no structure found, return appropriate message
    if (structureResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No structure found for this domain',
        domain: domainResult.rows[0] 
      });
    }
    
    // Return the structure data
    const structureData: DomainStructure = structureResult.rows[0];
    
    return res.status(200).json(structureData);
  } catch (error) {
    console.error(`Error fetching structure for domain ${id}:`, error);
    return res.status(500).json({ 
      message: `Error fetching structure for domain ${id}`, 
      error: (error as Error).message 
    });
  }
}