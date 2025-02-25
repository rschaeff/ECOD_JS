// pages/api/test-connection.ts
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
    // 1. Test database connection
    const connectionTestResult = await testDatabaseConnection();
    
    // 2. Test schema accessibility
    const schemaTestResult = await testSchemaAccess();
    
    // 3. Test table existence and basic data access
    const tablesTestResult = await testTablesExistence();
    
    // 4. Test specific queries from your APIs
    const sampleQueryResults = await testSampleQueries();
    
    // Return comprehensive results
    return res.status(200).json({
      success: true,
      database: {
        connection: connectionTestResult,
        schema: schemaTestResult,
        tables: tablesTestResult
      },
      queries: sampleQueryResults,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        databaseUrlProvided: !!process.env.DATABASE_URL,
        // Don't expose actual DATABASE_URL for security reasons
      }
    });
  } catch (error) {
    console.error('Error during database testing:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error testing database connection', 
      error: (error as Error).message,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        databaseUrlProvided: !!process.env.DATABASE_URL,
      }
    });
  }
}

// Test basic database connection
async function testDatabaseConnection() {
  try {
    // Simple query to test connection
    const result = await pool.query('SELECT NOW() as current_time');
    return {
      success: true,
      currentTime: result.rows[0].current_time,
      message: 'Successfully connected to the database'
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      success: false,
      message: 'Failed to connect to the database',
      error: (error as Error).message
    };
  }
}

// Test schema accessibility
async function testSchemaAccess() {
  try {
    // Check if we can access the swissprot schema
    const result = await pool.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'swissprot'
    `);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Swissprot schema not found'
      };
    }
    
    return {
      success: true,
      message: 'Successfully accessed swissprot schema'
    };
  } catch (error) {
    console.error('Schema access error:', error);
    return {
      success: false,
      message: 'Failed to check schema accessibility',
      error: (error as Error).message
    };
  }
}

// Test if tables exist and contain data
async function testTablesExistence() {
  // List of key tables to check
  const tables = [
    'domain_clusters',
    'domain_cluster_sets',
    'domain_cluster_members',
    'domain',
    'cluster_analysis',
    'protein_taxonomy',
    'taxonomy',
    'tgroup_names'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      // Check if table exists
      const existsResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'swissprot' 
          AND table_name = $1
        )
      `, [table]);
      
      const exists = existsResult.rows[0].exists;
      
      if (!exists) {
        results[table] = {
          exists: false,
          message: `Table ${table} does not exist`
        };
        continue;
      }
      
      // Count rows
      const countResult = await pool.query(`
        SELECT COUNT(*) as count FROM swissprot.${table}
      `);
      
      const count = parseInt(countResult.rows[0].count, 10);
      
      results[table] = {
        exists: true,
        rowCount: count,
        message: count > 0 
          ? `Table ${table} exists with ${count} rows` 
          : `Table ${table} exists but is empty`
      };
      
    } catch (error) {
      console.error(`Error checking table ${table}:`, error);
      results[table] = {
        exists: false,
        message: `Error checking table ${table}`,
        error: (error as Error).message
      };
    }
  }
  
  return results;
}

// Test sample queries from your APIs to verify data format
async function testSampleQueries() {
  const results = {};
  
  // Test 1: Fetch a single cluster
  try {
    // Get the ID of a random cluster
    const clusterIdResult = await pool.query(`
      SELECT id FROM swissprot.domain_clusters
      ORDER BY id
      LIMIT 1
    `);
    
    if (clusterIdResult.rows.length === 0) {
      results.clusterQuery = {
        success: false,
        message: 'No clusters found in database'
      };
    } else {
      const clusterId = clusterIdResult.rows[0].id;
      
      // Fetch the cluster using a simplified version of your cluster API query
      const clusterResult = await pool.query(`
        SELECT dc.id, dc.cluster_number, dc.cluster_set_id, dc.created_at
        FROM swissprot.domain_clusters dc
        WHERE dc.id = $1
      `, [clusterId]);
      
      results.clusterQuery = {
        success: true,
        message: 'Successfully fetched a cluster',
        sampleData: clusterResult.rows[0],
        dataFormat: {
          id: typeof clusterResult.rows[0].id,
          cluster_number: typeof clusterResult.rows[0].cluster_number,
          cluster_set_id: typeof clusterResult.rows[0].cluster_set_id,
          created_at: typeof clusterResult.rows[0].created_at
        }
      };
    }
  } catch (error) {
    console.error('Error testing cluster query:', error);
    results.clusterQuery = {
      success: false,
      message: 'Error testing cluster query',
      error: (error as Error).message
    };
  }
  
  // Test 2: Fetch cluster members
  try {
    // Get the ID of a random cluster
    const clusterIdResult = await pool.query(`
      SELECT id FROM swissprot.domain_clusters
      ORDER BY id
      LIMIT 1
    `);
    
    if (clusterIdResult.rows.length === 0) {
      results.membersQuery = {
        success: false,
        message: 'No clusters found in database'
      };
    } else {
      const clusterId = clusterIdResult.rows[0].id;
      
      // Fetch a sample of cluster members
      const membersResult = await pool.query(`
        SELECT 
          dcm.id, dcm.cluster_id, dcm.domain_id, dcm.sequence_identity, 
          dcm.alignment_coverage, dcm.is_representative
        FROM swissprot.domain_cluster_members dcm
        WHERE dcm.cluster_id = $1
        LIMIT 3
      `, [clusterId]);
      
      results.membersQuery = {
        success: true,
        message: 'Successfully fetched cluster members',
        sampleData: membersResult.rows,
        memberCount: membersResult.rows.length,
        dataFormat: membersResult.rows.length > 0 ? {
          id: typeof membersResult.rows[0].id,
          cluster_id: typeof membersResult.rows[0].cluster_id,
          domain_id: typeof membersResult.rows[0].domain_id,
          sequence_identity: typeof membersResult.rows[0].sequence_identity,
          alignment_coverage: typeof membersResult.rows[0].alignment_coverage,
          is_representative: typeof membersResult.rows[0].is_representative
        } : null
      };
    }
  } catch (error) {
    console.error('Error testing members query:', error);
    results.membersQuery = {
      success: false,
      message: 'Error testing members query',
      error: (error as Error).message
    };
  }
  
  // Test 3: Check taxonomy data
  try {
    const taxonomyResult = await pool.query(`
      SELECT tax_id, scientific_name, rank, parent_tax_id
      FROM swissprot.taxonomy
      LIMIT 3
    `);
    
    results.taxonomyQuery = {
      success: taxonomyResult.rows.length > 0,
      message: taxonomyResult.rows.length > 0 
        ? 'Successfully fetched taxonomy data' 
        : 'No taxonomy data found',
      sampleData: taxonomyResult.rows,
      dataFormat: taxonomyResult.rows.length > 0 ? {
        tax_id: typeof taxonomyResult.rows[0].tax_id,
        scientific_name: typeof taxonomyResult.rows[0].scientific_name,
        rank: typeof taxonomyResult.rows[0].rank,
        parent_tax_id: typeof taxonomyResult.rows[0].parent_tax_id
      } : null
    };
  } catch (error) {
    console.error('Error testing taxonomy query:', error);
    results.taxonomyQuery = {
      success: false,
      message: 'Error testing taxonomy query',
      error: (error as Error).message
    };
  }
  
  // Test 4: T-group names
  try {
    const tgroupResult = await pool.query(`
      SELECT tgroup_id, name
      FROM swissprot.tgroup_names
      LIMIT 3
    `);
    
    results.tgroupQuery = {
      success: tgroupResult.rows.length > 0,
      message: tgroupResult.rows.length > 0 
        ? 'Successfully fetched T-group data' 
        : 'No T-group data found',
      sampleData: tgroupResult.rows,
      dataFormat: tgroupResult.rows.length > 0 ? {
        tgroup_id: typeof tgroupResult.rows[0].tgroup_id,
        name: typeof tgroupResult.rows[0].name
      } : null
    };
  } catch (error) {
    console.error('Error testing T-group query:', error);
    results.tgroupQuery = {
      success: false,
      message: 'Error testing T-group query',
      error: (error as Error).message
    };
  }
  
  return results;
}
