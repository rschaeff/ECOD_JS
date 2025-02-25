// pages/api/dashboard/activity.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mocked recent activity (since there's no activity table)
    // In a real implementation, you would have a proper activity log table
    const recentActivity = [
      { 
        id: `cluster-${Math.floor(Math.random() * 5000)}`, 
        action: 'reclassified', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), 
        user: 'jsmith' 
      },
      { 
        id: `cluster-${Math.floor(Math.random() * 5000)}`, 
        action: 'validated', 
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), 
        user: 'apatil' 
      },
      { 
        id: `cluster-${Math.floor(Math.random() * 5000)}`, 
        action: 'flagged', 
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), 
        user: 'system' 
      },
      { 
        id: `cluster-${Math.floor(Math.random() * 5000)}`, 
        action: 'created', 
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), 
        user: 'system' 
      },
      { 
        id: `cluster-${Math.floor(Math.random() * 5000)}`, 
        action: 'updated', 
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), 
        user: 'mchen' 
      }
    ];
    
    return res.status(200).json(recentActivity);
  } catch (error) {
    console.error('Error fetching activity data:', error);
    return res.status(500).json({ 
      message: 'Error fetching activity data', 
      error: (error as Error).message 
    });
  }
}