// pages/api/structures/file.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Base directory for structure files - should be set in environment variables
const STRUCTURE_BASE_DIR = process.env.STRUCTURE_BASE_DIR || '/data/structures';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { path: filePath } = req.query;
  
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid file path' });
  }

  try {
    // Verify the file path exists in the database to prevent directory traversal attacks
    const fileResult = await pool.query(`
      SELECT file_path, file_type, file_hash, file_size
      FROM (
        SELECT file_path, file_type, file_hash, file_size FROM swissprot.domain_structure
        UNION
        SELECT file_path, file_type, file_hash, file_size FROM swissprot.protein_structure
      ) as structures
      WHERE file_path = $1
    `, [filePath]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ message: 'File not found in database' });
    }
    
    const fileRecord = fileResult.rows[0];
    
    // Construct absolute file path, ensuring it stays within the base directory
    // Normalize the path to prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
    const absolutePath = path.join(STRUCTURE_BASE_DIR, normalizedPath);
    
    // Check if file exists on disk
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream'; // Default
    if (fileRecord.file_type === 'pdb') {
      contentType = 'chemical/x-pdb';
    } else if (fileRecord.file_type === 'cif' || fileRecord.file_type === 'mmcif') {
      contentType = 'chemical/x-cif';
    }
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    
    // Optional: Verify file integrity with hash check
    // This would be more robust but adds overhead
    /*
    const fileBuffer = fs.readFileSync(absolutePath);
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    if (fileHash !== fileRecord.file_hash) {
      return res.status(500).json({ message: 'File integrity check failed' });
    }
    */
    
    // Stream the file to the client
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving structure file:', error);
    res.status(500).json({ message: 'Error serving structure file', error: (error as Error).message });
  }
}