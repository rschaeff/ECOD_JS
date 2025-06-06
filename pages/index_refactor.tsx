// pages/index_refactor.tsx
// pages/index.tsx
import React from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ClassificationStatusDashboard from '@/components/visualizations/ClassificationStatusDashboard';
import StructureQualityVisualization from '@/components/visualizations/StructureQualityVisualization';
import ClusterSetsTable from '@/components/dashboard/ClusterSetsTable';
import RecentClustersPanel from '@/components/dashboard/RecentClustersPanel';
import ReclassificationStats from '@/components/visualizations/ReclassificationStats';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PendingReclassificationsPanel from '@/components/dashboard/PendingReclassificationsPanel';
import QuickActionsPanel from '@/components/dashboard/QuickActionsPanel';

// Import hooks
import { useClusterSets } from '@/hooks/useClusterSets';
import { useClassificationData } from '@/hooks/useClassificationData';

export default function DomainClassificationDashboard() {
  const [selectedClusterSet, setSelectedClusterSet] = React.useState('all');
  const { data: clusterSetsData } = useClusterSets();
  const { data: classificationData } = useClassificationData();

  return (
    <>
      <Head>
        <title>Domain Classification Dashboard</title>
        <meta name="description" content="Dashboard for analyzing protein domain classification status" />
      </Head>

      <DashboardLayout title="Domain Classification Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <SummaryCards />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <ClassificationStatusDashboard 
              selectedClusterSet={selectedClusterSet}
              onClusterSetChange={setSelectedClusterSet}
            />
            
            <StructureQualityVisualization />
            
            <ClusterSetsTable 
              selectedClusterSet={selectedClusterSet}
              onClusterSetChange={setSelectedClusterSet}
            />
            
            <RecentClustersPanel />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ReclassificationStats />
            <ActivityFeed />
            <PendingReclassificationsPanel />
            <QuickActionsPanel />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}