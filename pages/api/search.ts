// pages/api/search.ts
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      query = '', 
      t_group = '',
      tax_id = '',
      page = '1', 
      limit = '20' 
    } = req.query;
    
    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build the WHERE clause for the search
    const conditions = [];
    const params = [];
    
    if (query && typeof query === 'string' && query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      conditions.push(`(
        d.domain_id ILIKE $${params.length + 1} OR 
        d.unp_acc ILIKE $${params.length + 1} OR 
        d.t_group ILIKE $${params.length + 1} OR
        tn.name ILIKE $${params.length + 1} OR
        t.scientific_name ILIKE $${params.length + 1}
      )`);
      params.push(searchTerm);
    }
    
    if (t_group && typeof t_group === 'string' && t_group.trim()) {
      conditions.push(`d.t_group = $${params.length + 1}`);
      params.push(t_group.trim());
    }
    
    if (tax_id && typeof tax_id === 'string' && tax_id.trim()) {
      conditions.push(`pt.tax_id = $${params.length + 1}`);
      params.push(tax_id.trim());
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Query for domains with pagination
    const domainsQuery = `
      SELECT 
        d.id,
        d.unp_acc,
        d.domain_id,
        d.range,
        d.t_group,
        tn.name as t_group_name,
        t.scientific_name as species,
        t.tax_id,
        swissprot.get_ancestor_name(t.tax_id, 'phylum') as phylum,
        EXISTS (
          SELECT 1 
          FROM swissprot.domain_structure ds 
          WHERE ds.domain_id = d.id
        ) as has_structure,
        (
          SELECT dcm.cluster_id
          FROM swissprot.domain_cluster_members dcm
          JOIN swissprot.domain_clusters dc ON dcm.cluster_id = dc.id
          WHERE dcm.domain_id = d.id
          ORDER BY dc.cluster_set_id
          LIMIT 1
        ) as primary_cluster_id
      FROM swissprot.domain d
      LEFT JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      LEFT JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      ${whereClause}
      ORDER BY d.domain_id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limitNum, offset);
    
    const domainsResult = await pool.query(domainsQuery, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM swissprot.domain d
      LEFT JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      LEFT JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].total, 10);
    
    // Get the search facets (for filtering)
    // T-group distribution in results
    const tGroupFacetsQuery = `
      SELECT 
        d.t_group,
        COALESCE(tn.name, d.t_group) as name,
        COUNT(*) as count
      FROM swissprot.domain d
      LEFT JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      LEFT JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      ${whereClause}
      GROUP BY d.t_group, COALESCE(tn.name, d.t_group)
      ORDER BY count DESC
      LIMIT 10
    `;
    
    const tGroupFacetsResult = await pool.query(tGroupFacetsQuery, params.slice(0, params.length - 2));
    const tGroupFacets = tGroupFacetsResult.rows;
    
    // Taxonomy distribution in results
    const taxonomyFacetsQuery = `
      SELECT 
        swissprot.get_ancestor_name(t.tax_id, 'superkingdom') as superkingdom,
        COUNT(*) as count
      FROM swissprot.domain d
      JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      ${whereClause}
      GROUP BY superkingdom
      ORDER BY count DESC
    `;
    
    const taxonomyFacetsResult = await pool.query(taxonomyFacetsQuery, params.slice(0, params.length - 2));
    const taxonomyFacets = taxonomyFacetsResult.rows;
    
    return res.status(200).json({
      domains: domainsResult.rows,
      total,
      page: pageNum,
      pageSize: limitNum,
      facets: {
        t_groups: tGroupFacets,
        taxonomy: taxonomyFacets
      }
    });
  } catch (error) {
    console.error('Error searching domains:', error);
    return res.status(500).json({ 
      message: 'Error searching domains', 
      error: (error as Error).message 
    });
  }
}
