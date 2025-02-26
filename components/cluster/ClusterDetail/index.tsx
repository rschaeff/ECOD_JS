// components/cluster/ClusterDetail/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { 
  useClusterData, 
  useStructureData 
} from '@/hooks/cluster';
import ClusterHeader from './ClusterHeader';
import ClusterMetricsCards from './ClusterMetricsCards';
import MembersTab from './tabs/MembersTab';
import TaxonomyTab from './tabs/TaxonomyTab';
import StructureTab from './tabs/StructureTab';
import AlignmentTab from './tabs/AlignmentTab';
import ValidationTab from './tabs/ValidationTab';
import ErrorDisplay from '../shared/ErrorDisplay';
import { Skeleton } from '@/components/ui/skeleton';

const ClusterDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Tab state
  const [activeTab, setActiveTab] = useState('members');
  
  // Selected domain for structure view
  const [selectedDomain, setSelectedDomain] = useState(null);
  
  // Fetch main cluster data
  const { 
    data: clusterData, 
    loading, 
    error, 
    refetch 
  } = useClusterData(id);
  
  // Fetch structure data for selected domain
  const { 
    structureData, 
    loading: loadingStructure 
  } = useStructureData(
    selectedDomain?.id, 
    activeTab === 'structure' && !!selectedDomain
  );
  
  // Handle domain selection
  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setActiveTab('structure');
  };
  
  // Show loading state
  if (loading) {
    return (
      <Layout title="Loading Cluster Data">
        <ClusterDetailSkeleton />
      </Layout>
    );
  }
  
  // Show error state
  if (error || !clusterData) {
    return (
      <Layout title="Error - Cluster Data">
        <ErrorDisplay 
          error={error || 'Failed to load cluster data'} 
          onRetry={refetch}
          returnLink="/dashboard/clusters"
          returnLinkText="Return to Cluster List"
        />
      </Layout>
    );
  }
  
  const clusterName = `Cluster-${clusterData.cluster.cluster_number}`;
  
  return (
    <Layout
      title={`${clusterName} - Cluster Detail`}
      description={`Detailed view of ${clusterName}`}
    >
      {/* Back link and page header */}
      <ClusterHeader clusterData={clusterData} />
      
      {/* Summary metric cards */}
      <ClusterMetricsCards 
        clusterData={clusterData} 
        onViewStructure={() => {
          if (clusterData.representative?.domain) {
            handleDomainSelect(clusterData.representative.domain);
          }
        }}
      />
      
      {/* Tab content */}
      <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Cluster Members</TabsTrigger>
          <TabsTrigger value="taxonomy">Taxonomy Distribution</TabsTrigger>
          <TabsTrigger value="structure">Structure Viewer</TabsTrigger>
          <TabsTrigger value="alignment">Sequence Alignment</TabsTrigger>
          <TabsTrigger value="validation">Cluster Validation</TabsTrigger>
        </TabsList>
        
        {/* Members tab */}
        <TabsContent value="members">
          <MembersTab 
            clusterId={Number(id)} 
            onDomainSelect={handleDomainSelect} 
          />
        </TabsContent>
        
        {/* Taxonomy tab */}
        <TabsContent value="taxonomy">
          <TaxonomyTab 
            taxonomyStats={clusterData.taxonomyStats}
            speciesDistribution={clusterData.speciesDistribution}
          />
        </TabsContent>
        
        {/* Structure tab */}
        <TabsContent value="structure">
          <StructureTab 
            domain={selectedDomain}
            structureData={structureData}
            isLoading={loadingStructure}
            onRefresh={() => {
              // Implement refresh logic
            }}
          />
        </TabsContent>
        
        {/* Alignment tab */}
        <TabsContent value="alignment">
          <AlignmentTab clusterId={Number(id)} activeTab={activeTab} />
        </TabsContent>
        
        {/* Validation tab */}
        <TabsContent value="validation">
          <ValidationTab clusterId={Number(id)} activeTab={activeTab} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ClusterDetailPage;