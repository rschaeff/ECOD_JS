// components/cluster/ClusterDetail/ClusterMetricsCards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClusterMetricsCardsProps {
  clusterData: {
    representative?: {
      domain: {
        domain_id: string;
        unp_acc: string;
        t_group: string;
      };
    };
    taxonomyDistribution?: {
      taxonomicDiversity: number | null;
      distinctFamilies: number;
      distinctPhyla: number;
      superkingdoms: string[];
    };
    analysis?: {
      structure_consistency: number | null;
    };
  };
  onViewStructure: () => void;
}

const ClusterMetricsCards: React.FC<ClusterMetricsCardsProps> = ({ 
  clusterData,
  onViewStructure
}) => {
  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="col-span-3 lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Representative Domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {clusterData.representative ? (
                <>
                  <p className="text-lg font-semibold">{clusterData.representative.domain.domain_id}</p>
                  <p className="text-sm">
                    <span className="font-medium">UniProt:</span> {clusterData.representative.domain.unp_acc}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">T-Group:</span> {clusterData.representative.domain.t_group}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={onViewStructure}
                  >
                    View Structure
                  </Button>
                </>
              ) : (
                <p className="text-sm text-gray-500">No representative domain found</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cluster Metrics</h3>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="text-sm">Taxonomic Diversity:</p>
                  <p className="text-lg font-semibold">
                    {formatPercentage(clusterData.taxonomyDistribution?.taxonomicDiversity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Structure Consistency:</p>
                  <p className="text-lg font-semibold">
                    {formatPercentage(clusterData.analysis?.structure_consistency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Distinct Families:</p>
                  <p className="text-lg font-semibold">
                    {clusterData.taxonomyDistribution?.distinctFamilies || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm">Distinct Phyla:</p>
                  <p className="text-lg font-semibold">
                    {clusterData.taxonomyDistribution?.distinctPhyla || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Superkingdoms:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {clusterData.taxonomyDistribution?.superkingdoms?.map((kingdom, index) => (
                    <Badge key={index} className="bg-green-500">{kingdom}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Classification Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold mb-3 ${
              !clusterData.analysis ? 'bg-gray-300' :
              clusterData.analysis.requires_new_classification ? 'bg-yellow-500' :
              'bg-green-500'
            }`}>
              {!clusterData.analysis ? 'Unknown' :
               clusterData.analysis.requires_new_classification ? 'Review' : 'Valid'}
            </div>
            <p className="text-sm">
              {!clusterData.analysis 
                ? 'Validation data not available for this cluster.' 
                : clusterData.analysis.requires_new_classification
                ? 'This cluster has been flagged for review. The current classification may need adjustment.'
                : 'This cluster appears to represent a valid evolutionary grouping.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClusterMetricsCards;