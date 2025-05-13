// pages/api/proteins/[id]/domains.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { Domain } from '@/services/api';

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
    // Query to get domains for the protein
    // This handles both UniProt accession and AlphaFold IDs (which would be in source_id)
    const domainsQuery = `
      SELECT 
        d.id, 
        d.unp_acc, 
        d.domain_id, 
        d.range, 
        d.t_group,
        tn.name as t_group_name,
        d.dpam_prob,
        d.hh_prob,
        d.judge,
        d.hcount,
        d.scount,
        (
          SELECT dcm.cluster_id 
          FROM swissprot.domain_cluster_members dcm 
          WHERE dcm.domain_id = d.id 
          ORDER BY dcm.is_representative DESC 
          LIMIT 1
        ) as primary_cluster_id
      FROM swissprot.domain d
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      LEFT JOIN swissprot.protein_sequence ps ON d.unp_acc = ps.unp_acc
      WHERE d.unp_acc = $1 OR ps.source_id = $1
      ORDER BY 
        CASE 
          WHEN d.range ~ '^[0-9]+-[0-9]+$' THEN 
            CAST(split_part(d.range, '-', 1) AS integer)
          ELSE 0
        END ASC
    `;

    const domainsResult = await pool.query(domainsQuery, [id]);
    
    // For each domain, get its taxonomy information (if available)
    const domainList = await Promise.all(domainsResult.rows.map(async (domain) => {
      // Get taxonomy information
      const taxonomyQuery = `
        SELECT 
          t.tax_id,
          t.scientific_name as species,
          swissprot.get_ancestor_name(t.tax_id, 'phylum') as phylum,
          swissprot.get_ancestor_name(t.tax_id, 'superkingdom') as superkingdom
        FROM swissprot.protein_taxonomy pt
        JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
        WHERE pt.unp_acc = $1
        LIMIT 1
      `;
      
      const taxonomyResult = await pool.query(taxonomyQuery, [domain.unp_acc]);
      const taxonomyInfo = taxonomyResult.rows.length > 0 ? taxonomyResult.rows[0] : null;
      
      // Check if the domain has structure
      const structureQuery = `
        SELECT COUNT(*) as structure_count
        FROM swissprot.domain_structure
        WHERE domain_id = $1
      `;
      
      const structureResult = await pool.query(structureQuery, [domain.id]);
      const hasStructure = parseInt(structureResult.rows[0].structure_count) > 0;
      
      return {
        ...domain,
        species: taxonomyInfo?.species || null,
        phylum: taxonomyInfo?.phylum || null,
        tax_id: taxonomyInfo?.tax_id || null,
        superkingdom: taxonomyInfo?.superkingdom || null,
        has_structure: hasStructure
      };
    }));
    
    // Get protein metadata
    const proteinQuery = `
      SELECT 
        ps.unp_acc,
        ps.source_id,
        ps.sequence_length,
        t.scientific_name as species,
        t.tax_id
      FROM swissprot.protein_sequence ps
      LEFT JOIN swissprot.protein_taxonomy pt ON ps.unp_acc = pt.unp_acc
      LEFT JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      WHERE ps.unp_acc = $1 OR ps.source_id = $1
      LIMIT 1
    `;
    
    const proteinResult = await pool.query(proteinQuery, [id]);
    const proteinInfo = proteinResult.rows.length > 0 ? proteinResult.rows[0] : null;
    
    // Get structure information
    const structureQuery = `
      SELECT 
        id,
        source,
        file_type,
        resolution,
        confidence_score
      FROM swissprot.protein_structure
      WHERE unp_acc = $1 OR source_id = $1
      ORDER BY is_current DESC, confidence_score DESC
      LIMIT 1
    `;
    
    const structureResult = await pool.query(structureQuery, [id]);
    const structureInfo = structureResult.rows.length > 0 ? structureResult.rows[0] : null;
    
    return res.status(200).json({
      protein: proteinInfo,
      structure: structureInfo,
      domains: domainList,
      count: domainList.length
    });
  } catch (error) {
    console.error(`Error fetching domains for protein ${id}:`, error);
    return res.status(500).json({ 
      message: 'Error fetching protein domains', 
      error: (error as Error).message 
    });
  }
}
