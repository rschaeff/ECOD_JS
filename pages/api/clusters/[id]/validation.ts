// pages/api/clusters/[id]/validation.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { ValidationData } from '@/services/api';

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
    // Get cluster analysis data
    const analysisResult = await pool.query(`
      SELECT 
        structure_consistency, 
        experimental_support_ratio,
        taxonomic_diversity,
        requires_new_classification,
        analysis_notes
      FROM swissprot.cluster_analysis
      WHERE cluster_id = $1
    `, [id]);
    
    if (analysisResult.rows.length === 0) {
      return res.status(404).json({ message: 'Validation data not found for this cluster' });
    }
    
    const analysis = analysisResult.rows[0];
    
    // Get T-group homogeneity
    const tgroupResult = await pool.query(`
      WITH tgroup_counts AS (
        SELECT 
          d.t_group, 
          COUNT(*) as count
        FROM swissprot.domain_cluster_members dcm
        JOIN swissprot.domain d ON dcm.domain_id = d.id
        WHERE dcm.cluster_id = $1
        GROUP BY d.t_group
        ORDER BY count DESC
      ),
      total_count AS (
        SELECT COUNT(*) as total
        FROM swissprot.domain_cluster_members
        WHERE cluster_id = $1
      )
      SELECT 
        (SELECT count FROM tgroup_counts LIMIT 1) / (SELECT total FROM total_count) as tgroup_homogeneity
    `, [id]);
    
    const tgroupHomogeneity = tgroupResult.rows[0]?.tgroup_homogeneity || 0;
    
    // Determine classification status
    let status: 'Valid' | 'Invalid' | 'Needs Review' = 'Needs Review';
    if (analysis.requires_new_classification) {
      status = 'Needs Review';
    } else if (analysis.structure_consistency >= 0.8 && tgroupHomogeneity >= 0.75) {
      status = 'Valid';
    } else if (analysis.structure_consistency < 0.5 || tgroupHomogeneity < 0.5) {
      status = 'Invalid';
    }
    
    // Generate notes based on the analysis
    let notes = '';
    if (status === 'Valid') {
      notes = 'This cluster appears to represent a valid evolutionary grouping based on both sequence and structural analysis.';
      if (tgroupHomogeneity >= 0.8) {
        notes += ` The domains show consistent fold assignment with ${Math.round(tgroupHomogeneity * 100)}% belonging to the same T-group.`;
      }
      if (analysis.taxonomic_diversity >= 0.6) {
        notes += ' The high taxonomic diversity suggests this domain is evolutionarily conserved across multiple phyla, which further supports its classification.';
      }
    } else if (status === 'Invalid') {
      notes = 'This cluster shows inconsistencies that may indicate problems with the classification.';
      if (analysis.structure_consistency < 0.5) {
        notes += ' The structures within this cluster show significant variability, suggesting potential misclassification.';
      }
      if (tgroupHomogeneity < 0.5) {
        notes += ' The cluster contains domains from multiple T-groups, which may indicate incorrect grouping.';
      }
    } else {
      notes = 'This cluster requires manual review to determine the appropriate classification.';
      if (analysis.requires_new_classification) {
        notes += ' The automated analysis suggests this may represent a new fold or domain family not currently in the database.';
      }
      if (analysis.analysis_notes) {
        notes += ' ' + analysis.analysis_notes;
      }
    }
    
    // Construct and return validation data
    const validationData: ValidationData = {
      structuralValidation: {
        structureConsistency: analysis.structure_consistency || 0,
        experimentalSupport: analysis.experimental_support_ratio || 0
      },
      taxonomicValidation: {
        taxonomicDiversity: analysis.taxonomic_diversity || 0,
        tgroupHomogeneity
      },
      classificationAssessment: {
        status,
        notes
      }
    };
    
    return res.status(200).json(validationData);
  } catch (error) {
    console.error('Error fetching validation data:', error);
    return res.status(500).json({ message: 'Error fetching validation data', error: (error as Error).message });
  }
}
