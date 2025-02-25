// pages/api/clusters/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { ClusterDetail } from '@/services/api';

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
    // Get the cluster details
    const clusterResult = await pool.query(`
      SELECT dc.id, dc.cluster_number, dc.cluster_set_id, dc.created_at
      FROM swissprot.domain_clusters dc
      WHERE dc.id = $1
    `, [id]);
    
    if (clusterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cluster not found' });
    }
    
    const cluster = clusterResult.rows[0];
    
    // Get cluster set info
    const clusterSetResult = await pool.query(`
      SELECT id, name, method, sequence_identity, description, created_at
      FROM swissprot.domain_cluster_sets
      WHERE id = $1
    `, [cluster.cluster_set_id]);
    
    const clusterSet = clusterSetResult.rows[0];
    
    // Get cluster members with domain info
    const membersResult = await pool.query(`
      SELECT 
        dcm.id, dcm.cluster_id, dcm.domain_id, dcm.sequence_identity, 
        dcm.alignment_coverage, dcm.is_representative,
        d.unp_acc, d.domain_id as domain_identifier, d.range, d.t_group
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      WHERE dcm.cluster_id = $1
      ORDER BY dcm.is_representative DESC, dcm.sequence_identity DESC
    `, [id]);
    
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
        t_group: row.t_group
      }
    }));
    
    // Get the representative member
    const representative = members.find(m => m.is_representative);
    
    // Get analysis data
    const analysisResult = await pool.query(`
      SELECT id, cluster_id, taxonomic_diversity, structure_consistency, 
             experimental_support_ratio, requires_new_classification, analysis_notes
      FROM swissprot.cluster_analysis
      WHERE cluster_id = $1
    `, [id]);
    
    const analysis = analysisResult.rows.length > 0 ? analysisResult.rows[0] : null;
    
    // Get taxonomy distribution
    const taxonomyResult = await pool.query(`
      WITH taxonomy_data AS (
        SELECT 
          pt.tax_id,
          t.scientific_name as species,
          swissprot.get_ancestor_name(pt.tax_id, 'family') as family,
          swissprot.get_ancestor_name(pt.tax_id, 'phylum') as phylum,
          swissprot.get_ancestor_name(pt.tax_id, 'superkingdom') as superkingdom
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
        JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
        WHERE dcm.cluster_id = $1
      )
      SELECT 
        COUNT(DISTINCT family) as distinct_families,
        COUNT(DISTINCT phylum) as distinct_phyla,
        ARRAY_AGG(DISTINCT superkingdom) as superkingdoms
      FROM taxonomy_data
    `, [id]);
    
    const taxonomyDistribution = taxonomyResult.rows[0];
    
    // Get T-group distribution
    const tGroupResult = await pool.query(`
      SELECT 
        d.t_group, 
        COUNT(*) as count,
        tn.name as name
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      LEFT JOIN swissprot.tgroup_names tn ON tn.tgroup_id = d.t_group
      WHERE dcm.cluster_id = $1
      GROUP BY d.t_group, tn.name
      ORDER BY count DESC
    `, [id]);
    
    const tGroupDistribution = tGroupResult.rows;
    
    // Get taxonomy stats (phylum distribution)
    const taxonomyStatsResult = await pool.query(`
      SELECT 
        swissprot.get_ancestor_name(pt.tax_id, 'phylum') as phylum,
        COUNT(*) as count
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      WHERE dcm.cluster_id = $1
      GROUP BY phylum
      ORDER BY count DESC
    `, [id]);
    
    const taxonomyStats = taxonomyStatsResult.rows;
    
    // Get species distribution
    const speciesDistResult = await pool.query(`
      SELECT 
        t.scientific_name as species,
        COUNT(*) as count
      FROM swissprot.domain_cluster_members dcm
      JOIN swissprot.domain d ON dcm.domain_id = d.id
      JOIN swissprot.protein_taxonomy pt ON d.unp_acc = pt.unp_acc
      JOIN swissprot.taxonomy t ON pt.tax_id = t.tax_id
      WHERE dcm.cluster_id = $1
      GROUP BY species
      ORDER BY count DESC
      LIMIT 10
    `, [id]);
    
    const speciesDistribution = speciesDistResult.rows;
    
    // Count total cluster members
    const countResult = await pool.query(`
      SELECT COUNT(*) as size
      FROM swissprot.domain_cluster_members
      WHERE cluster_id = $1
    `, [id]);
    
    const size = parseInt(countResult.rows[0].size, 10);
    
    // Construct and return the full cluster detail
    const clusterDetail: ClusterDetail = {
      cluster,
      clusterSet,
      members,
      representative: representative ?? null,
      analysis,
      taxonomyDistribution: {
        ...taxonomyDistribution,
        taxonomicDiversity: analysis?.taxonomic_diversity || null
      },
      tGroupDistribution,
      taxonomyStats,
      speciesDistribution,
      size
    };
    
    return res.status(200).json(clusterDetail);
  } catch (error) {
    console.error('Error fetching cluster data:', error);
    return res.status(500).json({ message: 'Error fetching cluster data', error: (error as Error).message });
  }
}
