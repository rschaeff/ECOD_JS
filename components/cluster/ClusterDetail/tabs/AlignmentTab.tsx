// components/cluster/ClusterDetail/tabs/AlignmentTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { useClusterMsa } from '@/hooks/cluster';
import ErrorDisplay from '../shared/ErrorDisplay';

interface AlignmentTabProps {
  clusterId: number;
  activeTab: string;
}

const AlignmentTab: React.FC<AlignmentTabProps> = ({ clusterId, activeTab }) => {
  const { msaData, loading, error, refetch } = useClusterMsa(clusterId, activeTab === 'alignment');
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multiple Sequence Alignment</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multiple Sequence Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay error={error} onRetry={refetch} />
        </CardContent>
      </Card>
    );
  }
  
  if (!msaData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multiple Sequence Alignment</CardTitle>
        </CardHeader>
        <CardContent className="h-96 flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">No alignment data available</p>
          <Button variant="outline" onClick={refetch}>
            Load Alignment Data
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Multiple Sequence Alignment</CardTitle>
          <div className="text-sm text-gray-500">
            Alignment of {msaData.num_sequences} sequences with length {msaData.alignment_length}
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-1">
          <Download size={16} />
          <span>Export Alignment</span>
        </Button>
      </CardHeader>
      <CardContent>
        {/* MSA visualization content would go here */}
        <div className="h-96 bg-gray-50 p-4 rounded border overflow-auto font-mono text-xs">
          {/* This is where you'd implement or integrate an MSA viewer */}
          <div className="text-center text-gray-500">
            MSA Visualization would be displayed here
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlignmentTab;