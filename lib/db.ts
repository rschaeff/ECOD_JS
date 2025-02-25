// lib/db.ts
import { Pool } from 'pg';

// Declare global to prevent multiple Pool instances in Next.js
declare global {
  var postgresPool: Pool | undefined;
}

// Secure method to get database connection details
const getDatabaseConfig = () => {
  const host = process.env.DB_HOST || 'dione';
  const database = process.env.DB_DATABASE || 'ecod_protein';
  const user = process.env.DB_USER || 'ecod';
  const password = process.env.DB_PASSWORD || 'ecod#admin';
  const port = parseInt(process.env.DB_PORT || '45000');

  return {
    host,
    database,
    user,
    password,
    port,
    // Optional SSL configuration for production
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  };
};

// Create or reuse PostgreSQL connection pool
const pool = global.postgresPool || new Pool(getDatabaseConfig());

// Only create global pool in development
if (process.env.NODE_ENV !== 'production') {
  global.postgresPool = pool;
}

export default pool;

// Utility function for safer queries
export async function queryDatabase(
  query: string, 
  params?: any[]
) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Debugging function to test connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database Connection Error:', error);
    return false;
  }
}
