import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  BarChart2, 
  Filter, 
  Download, 
  RefreshCw, 
  Search, 
  FileText, 
  Database, 
  AlertTriangle,
  Share2,
  Settings
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiService from '@/services/api';

interface QuickActionsPanelProps {
  className?: string;
  onRefreshAllData?: () => Promise<void>;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  className,
  onRefreshAllData
}) => {
  const router = useRouter();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Define action handlers
  const handleAction = async (actionId: string, handler: () => Promise<any>) => {
    setActiveAction(actionId);
    setActionStatus(null);
    
    try {
      await handler();
      setActionStatus({ success: true, message: 'Action completed successfully' });
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error);
      setActionStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      // Clear active action after a delay to show completion state
      setTimeout(() => {
        setActiveAction(null);
      }, 1000);
    }
  };

  // Handle taxonomy analysis
  const runTaxonomyAnalysis = () => handleAction('taxonomy', async () => {
    // This would be a real API call
    await apiService.runTaxonomyAnalysis();
  });

  // Handle filter clusters
  const navigateToFilterClusters = () => {
    router.push('/clusters?filter=true');
  };

  // Handle export data
  const exportDomainData = () => handleAction('export', async () => {
    // This would trigger a file download in a real app
    const data = await apiService.exportDomainData();
    
    // Simulate file download
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domain_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Handle refresh all data
  const refreshAllData = () => handleAction('refresh', async () => {
    if (onRefreshAllData) {
      await onRefreshAllData();
    } else {
      // Fallback refresh logic if no handler provided
      await Promise.all([
        apiService.getDashboardSummary(),
        apiService.getDashboardClusterSets(),
        apiService.getDashboardTaxonomy()
      ]);
    }
  });

  // Handle search
  const navigateToSearch = () => {
    router.push('/search');
  };

  // Handle documentation
  const navigateToDocumentation = () => {
    router.push('/documentation');
  };

  // Handle structure validation
  const runStructureValidation = () => handleAction('validation', async () => {
    // This would be a real API call
    await apiService.runStructureValidation();
  });

  // Handle advanced settings
  const navigateToSettings = () => {
    router.push('/settings');
  };

  // Define action buttons
  const actionButtons = [
    {
      id: 'taxonomy',
      label: 'Run Taxonomy Analysis',
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
      handler: runTaxonomyAnalysis,
      tooltip: 'Analyze taxonomy distribution across clusters',
      primary: true
    },
    {
      id: 'filter',
      label: 'Filter Clusters',
      icon: <Filter className="h-4 w-4 mr-2" />,
      handler: navigateToFilterClusters,
      tooltip: 'Apply filters to cluster views',
      primary: true
    },
    {
      id: 'export',
      label: 'Export Domain Data',
      icon: <Download className="h-4 w-4 mr-2" />,
      handler: exportDomainData,
      tooltip: 'Export domain data in JSON format',
      primary: true
    },
    {
      id: 'refresh',
      label: 'Refresh All Data',
      icon: <RefreshCw className={`h-4 w-4 mr-2 ${activeAction === 'refresh' ? 'animate-spin' : ''}`} />,
      handler: refreshAllData,
      tooltip: 'Refresh all dashboard data',
      primary: true
    },
    {
      id: 'search',
      label: 'Advanced Search',
      icon: <Search className="h-4 w-4 mr-2" />,
      handler: navigateToSearch,
      tooltip: 'Perform advanced search on domains and clusters',
      primary: false
    },
    {
      id: 'documentation',
      label: 'Documentation',
      icon: <FileText className="h-4 w-4 mr-2" />,
      handler: navigateToDocumentation,
      tooltip: 'View system documentation',
      primary: false
    },
    {
      id: 'validation',
      label: 'Validate Structures',
      icon: <Database className="h-4 w-4 mr-2" />,
      handler: runStructureValidation,
      tooltip: 'Run validation on protein structures',
      primary: false
    },
    {
      id: 'settings',
      label: 'Dashboard Settings',
      icon: <Settings className="h-4 w-4 mr-2" />,
      handler: navigateToSettings,
      tooltip: 'Configure dashboard settings',
      primary: false
    }
  ];

  return (
    <Card className={className} data-testid="quick-actions-panel">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used tools and operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show action status message if present */}
        {actionStatus && (
          <Alert 
            className={`mb-4 ${actionStatus.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}
          >
            {actionStatus.success ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            <AlertDescription>{actionStatus.message}</AlertDescription>
          </Alert>
        )}

        <TooltipProvider>
          <div className="space-y-2">
            {/* Primary actions (displayed prominently) */}
            {actionButtons.filter(btn => btn.primary).map(action => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={action.handler}
                    disabled={activeAction !== null}
                    data-testid={`action-${action.id}`}
                  >
                    {activeAction === action.id ? (
                      <>
                        {action.icon}
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {action.icon}
                        <span>{action.label}</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Divider between primary and secondary actions */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-500">More Actions</span>
              </div>
            </div>

            {/* Secondary actions (less prominent) */}
            <div className="grid grid-cols-2 gap-2">
              {actionButtons.filter(btn => !btn.primary).map(action => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="justify-start"
                      onClick={action.handler}
                      disabled={activeAction !== null}
                      data-testid={`action-${action.id}`}
                    >
                      {activeAction === action.id ? (
                        <>
                          {action.icon}
                          <span className="ml-1 truncate">Processing...</span>
                        </>
                      ) : (
                        <>
                          {action.icon}
                          <span className="ml-1 truncate">{action.label}</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-gray-500 flex items-center"
          onClick={() => window.open('https://domain-clusters.example.com/support', '_blank')}
        >
          <Share2 className="h-3 w-3 mr-1" />
          Share feedback
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuickActionsPanel;