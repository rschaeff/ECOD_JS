// pages/clusters/[id].tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { useCombinedClusterData } from '@/hooks/cluster';
import ClusterHeader from '@/components/cluster/ClusterDetail/ClusterHeader';
import ClusterMetricsCards from '@/components/cluster/ClusterDetail/ClusterMetricsCards';
import MembersTab from '@/components/cluster/ClusterDetail/tabs/MembersTab';
import TaxonomyTab from '@/components/cluster/ClusterDetail/tabs/TaxonomyTab';
import StructureTab from '@/components/cluster/ClusterDetail/tabs/StructureTab';
import AlignmentTab from '@/components/cluster/ClusterDetail/tabs/AlignmentTab';
import ValidationTab from '@/components/cluster/ClusterDetail/tabs/ValidationTab';
import ErrorDisplay from '@/components/cluster/shared/ErrorDisplay';
import ClusterDetailSkeleton from '@/components/cluster/ClusterDetail/ClusterDetailSkeleton';

const ClusterDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Use the combined hook for managing all cluster data
  const {
    activeTab,
    setActiveTab,
    selectedDomain,
    handleDomainSelect,
    clusterData,
    structureData,
    isLoading,
    hasError,
    refetchAll
  } = useCombinedClusterData(id);
  
  // Handle export data
  const handleExportData = () => {
    if (!clusterData.data) return;
    
    // Create CSV content for basic cluster info
    const basicInfo = [
      'Cluster ID,Cluster Number,Cluster Set,Sequence Identity,Size,Taxonomic Diversity,Structure Consistency',
      `"${clusterData.data.cluster.id}","${clusterData.data.cluster.cluster_number}","${clusterData.data.clusterSet?.name || ''}","${clusterData.data.clusterSet?.sequence_identity || 0}","${clusterData.data.size}","${clusterData.data.taxonomyDistribution?.taxonomicDiversity || 0}","${clusterData.data.analysis?.structure_consistency || 0}"`
    ].join('\n');
    
    // Create a download link
    const blob = new Blob([basicInfo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cluster_${id}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Show loading state
  if (isLoading || clusterData.loading) {
    return (
      <Layout title="Loading Cluster Data">
        <ClusterDetailSkeleton />
      </Layout>
    );
  }
  
  // Show error state
  if (hasError || clusterData.error || !clusterData.data) {
    return (
      <Layout title="Error - Cluster Data">
        <ErrorDisplay 
          error={clusterData.error || 'Failed to load cluster data'} 
          onRetry={refetchAll}
          returnLink="/dashboard/clusters"
          returnLinkText="Return to Cluster List"
        />
      </Layout>
    );
  }
  
  const clusterName = `Cluster-${clusterData.data.cluster.cluster_number}`;
  
  return (
    <Layout
      title={`${clusterName} - Cluster Detail`}
      description={`Detailed view of ${clusterName}`}
    >
      {/* Cluster header with title and back link */}
      <ClusterHeader 
        clusterData={clusterData.data} 
        onExport={handleExportData}
      />
      
      {/* Summary metric cards */}
      <ClusterMetricsCards 
        clusterData={clusterData.data} 
        onViewStructure={() => {
          if (clusterData.data.representative?.domain) {
            handleDomainSelect(clusterData.data.representative.domain);
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
            clusterId={Number(id)}
            taxonomyStats={clusterData.data.taxonomyStats}
            speciesDistribution={clusterData.data.speciesDistribution}
            superkingdoms={clusterData.data.taxonomyDistribution?.superkingdoms || []}
            distinctPhyla={clusterData.data.taxonomyDistribution?.distinctPhyla || 0}
            distinctFamilies={clusterData.data.taxonomyDistribution?.distinctFamilies || 0}
            taxonomicDiversity={clusterData.data.taxonomyDistribution?.taxonomicDiversity || 0}
            isLoading={false}
            onRefresh={() => clusterData.refetch()}
          />
        </TabsContent>
        
        {/* Structure tab */}
        <TabsContent value="structure">
          <StructureTab 
            domain={selectedDomain}
            clusterId={Number(id)}
            activeTab={activeTab}
            onSelectDomain={handleDomainSelect}
          />
        </TabsContent>
        
        {/* Alignment tab */}
        <TabsContent value="alignment">
          <AlignmentTab 
            clusterId={Number(id)} 
            activeTab={activeTab} 
          />
        </TabsContent>
        
        {/* Validation tab */}
        <TabsContent value="validation">
          <ValidationTab 
            clusterId={Number(id)} 
            activeTab={activeTab} 
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ClusterDetailPage;