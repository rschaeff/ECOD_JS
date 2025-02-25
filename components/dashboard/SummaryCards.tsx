// /components/dashboard/SummaryCards.tsx

import React from 'react';
import { Database, Grid, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardSummaryData } from '@/hooks/useDashboardSummary';

interface SummaryCardsProps {
  className?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ className }) => {
  const { data, loading, error, refresh, isRefreshing } = useDashboardSummaryData();

  // Card configurations for easy maintenance and consistency
  const cardConfigs = [
    {
      id: 'totalClusters',
      title: 'Total Clusters',
      value: data?.totalClusters || 0,
      icon: <Database className="h-8 w-8 text-blue-500" />,
      description: `Across ${data?.clusterSetsCount || 0} cluster sets`,
      dataTestId: 'summary-card-clusters'
    },
    {
      id: 'totalDomains',
      title: 'Total Domains',
      value: data?.totalDomains || 0,
      icon: <Grid className="h-8 w-8 text-green-500" />,
      description: 'With sequence and structure data',
      dataTestId: 'summary-card-domains'
    },
    {
      id: 'needsReview',
      title: 'Needs Review',
      value: data?.needsReview || 0,
      icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
      description: 'Clusters flagged for reclassification',
      dataTestId: 'summary-card-review'
    }
  ];

  // Format for large numbers (with commas)
  const formatNumber = (value: number) => value.toLocaleString();

  // If all data is loading, show skeletons for all cards
  if (loading && !data) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`} data-testid="summary-cards-loading">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`${className}`} data-testid="summary-cards-error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={refresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Trying again...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render the actual cards
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`} data-testid="summary-cards">
      {cardConfigs.map((card) => (
        <Card key={card.id} data-testid={card.dataTestId}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold">
                {isRefreshing ? (
                  <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
                ) : (
                  formatNumber(card.value)
                )}
              </div>
              {card.icon}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {card.description}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;