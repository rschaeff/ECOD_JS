// pages/api/dashboard/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  return res.status(200).json({
    message: 'Dashboard API is now split into separate endpoints for better performance',
    endpoints: [
      '/api/dashboard/summary',
      '/api/dashboard/clustersets',
      '/api/dashboard/taxonomy',
      '/api/dashboard/activity',
      '/api/dashboard/reclassifications',
      '/api/dashboard/recentclusters'
    ]
  });
}