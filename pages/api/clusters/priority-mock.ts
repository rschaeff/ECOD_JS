// pages/api/clusters/priority-mock.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Parse query parameters
  const limit = parseInt(req.query.limit as string || '5', 10);
  const category = req.query.category as string || 'all';

  // Generate mock data
  const mockData = generateMockData(limit, category);
  
  // Simulate server delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return res.status(200).json(mockData);
}

function generateMockData(limit: number, categoryFilter: string) {
  const mockCategories = ['unclassified', 'flagged', 'reclassification', 'diverse'];
  const mockClusters = [];
  
  // Generate random clusters
  for (let i = 0; i < limit; i++) {
    const categoryIndex = i % mockCategories.length;
    const category = mockCategories[categoryIndex];
    
    // Skip if filtering by category and this doesn't match
    if (categoryFilter !== 'all' && category !== categoryFilter) {
      continue;
    }
    
    mockClusters.push({
      id: `${i + 100}`,
      name: `Cluster-${i + 100}`,
      size: Math.floor(Math.random() * 20) + 2, // Random size between 2-21 (no singletons)
      category,
      representativeDomain: `d${Math.floor(Math.random() * 10000)}.1`,
      taxonomicDiversity: Math.random() * 0.8 + 0.1, // Random value between 0.1-0.9
      structuralDiversity: category === 'diverse' ? Math.random() * 0.8 + 0.1 : undefined,
      t_group: `${Math.floor(Math.random() * 3000)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      t_group_name: category === 'unclassified' ? undefined : 'Alpha/Beta-Hydrolases',
      cluster_number: i + 100,
      cluster_set_id: Math.floor(Math.random() * 3) + 1
    });
  }
  
  // Generate totals
  const totals = {
    unclassified: Math.floor(Math.random() * 1000) + 100,
    flagged: Math.floor(Math.random() * 500) + 50,
    reclassification: Math.floor(Math.random() * 300) + 30,
    diverse: Math.floor(Math.random() * 800) + 80,
    all: 0
  };
  
  totals.all = totals.unclassified + totals.flagged + totals.reclassification + totals.diverse;
  
  return {
    clusters: mockClusters,
    totals
  };
}