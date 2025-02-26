// components/cluster/ClusterDetail/tabs/StructureTab.tsx
import React, { useState } from 'react';
import { AlertTriangle, Download, FileText, ChevronDown, ChevronUp, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MoleculeViewer from '@/components/MoleculeViewer';
import { useStructureData } from '@/hooks/cluster';
import MetricProgress from '../../shared/MetricProgress';
import ErrorDisplay from '../../shared/ErrorDisplay';
import { Domain, DomainStructure } from '@/types';

interface StructureTabProps {
  domain: Domain | null;
  clusterId: number;
  activeTab: string;
  onSelectDomain?: (domain: Domain) => void;
}

const StructureTab: React.FC<StructureTabProps> = ({ 
  domain, 
  clusterId, 
  activeTab,
  onSelectDomain 
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [validationExpanded, setValidationExpanded] = useState(true);
  const [pdbUrl, setPdbUrl] = useState<string | null>(null);
  
  // Fetch structure data when domain is selected and tab is active
  const { 
    structureData,
    loading,
    error,
    refetch
  } = useStructureData(domain?.id, activeTab === 'structure' && !!domain);
  
  // Effect to format the PDB URL correctly when structure data is available
  React.useEffect(() => {
    if (structureData?.file_path) {
      // For real implementation, you would point to your API or static files
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      setPdbUrl(`${apiBaseUrl}/structures/file?path=${encodeURIComponent(structureData.file_path)}`);
    } else {
      setPdbUrl(null);
    }
  }, [structureData]);
  
  // Handle full screen toggle
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // In a real implementation, you might want to also handle browser full screen API
  };
  
  // Get structure source badge info
  const getStructureSourceInfo = () => {
    if (!structureData) return { label: 'Unknown', color: 'bg-gray-500' };
    
    switch (structureData.source) {
      case 'alphafold':
        return { 
          label: `AlphaFold${structureData.source_version ? ` (${structureData.source_version})` : ''}`, 
          color: 'bg-blue-500'
        };
      case 'experimental':
        return { 
          label: `Experimental${structureData.resolution ? ` (${structureData.resolution}Å)` : ''}`, 
          color: 'bg-green-500'
        };
      case 'custom':
        return { label: 'Custom Model', color: 'bg-purple-500' };
      default:
        return { label: structureData.source, color: 'bg-gray-500' };
    }
  };
  
  const sourceInfo = getStructureSourceInfo();
  
  // Format confidence level for pLDDT
  const getPlddtConfidenceLabel = (plddt: number | null | undefined) => {
    if (plddt === null || plddt === undefined) return '';
    if (plddt >= 90) return '(Very high confidence)';
    if (plddt >= 70) return '(High confidence)';
    if (plddt >= 50) return '(Medium confidence)';
    return '(Low confidence)';
  };
  
  // Structure download handler
  const handleDownloadStructure = () => {
    if (!pdbUrl) return;
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = pdbUrl;
    link.download = `${domain?.domain_id || 'structure'}.pdb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Show domain selection prompt if no domain selected
  if (!domain) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Structure Viewer</CardTitle>
          <CardDescription>
            Select a domain to view its 3D structure
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center text-center">
          <Info className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 mb-2">No domain selected</p>
          <p className="text-sm text-gray-500 mb-4">
            Please select a domain from the cluster members to view its 3D structure
          </p>
          <Button 
            variant="outline"
            onClick={() => onSelectDomain && onSelectDomain(null)}
          >
            Go to Members Tab
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Structure Viewer */}
      <MoleculeViewer
        pdbId={null}  // We'll use pdbUrl instead
        pdbUrl={pdbUrl}
        title={`Domain Structure: ${domain.domain_id || 'Loading...'}`}
        description={structureData 
          ? `${sourceInfo.label} structure for ${domain.domain_id || ''} (${domain.unp_acc || ''})`
          : "No structure data available"
        }
        initialRenderStyle="cartoon"
        height="550px"
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
        isLoading={loading || !pdbUrl}
      />
      
      {/* Hide details when in full-screen mode */}
      {!isFullScreen && (
        <>
          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={refetch}
            />
          )}
          
          {/* Structure Metadata */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setMetadataExpanded(!metadataExpanded)}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  Structure Metadata
                  {structureData && (
                    <Badge className={sourceInfo.color}>{sourceInfo.label}</Badge>
                  )}
                </CardTitle>
                {metadataExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            
            {metadataExpanded && (
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : !structureData ? (
                  <div className="text-center py-6 text-gray-500">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>No structure metadata available for this domain</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Basic Information</h3>
                      <Table>
                        <TableBody className="text-sm">
                          <TableRow>
                            <TableCell className="font-medium">Domain ID</TableCell>
                            <TableCell>{domain.domain_id || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">UniProt Acc</TableCell>
                            <TableCell>{domain.unp_acc || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Residue Range</TableCell>
                            <TableCell>{domain.range || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Source</TableCell>
                            <TableCell>{structureData.source || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">File Type</TableCell>
                            <TableCell>{structureData.file_type || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">File Path</TableCell>
                            <TableCell className="truncate max-w-xs">{structureData.file_path || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Quality Metrics</h3>
                      <div className="space-y-4">
                        {/* AlphaFold specific metrics */}
                        {structureData.source === 'alphafold' && (
                          <div className="space-y-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Mean pLDDT</span>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  !structureData.mean_plddt ? 'bg-gray-300' :
                                  structureData.mean_plddt >= 90 ? 'bg-green-500' :
                                  structureData.mean_plddt >= 70 ? 'bg-blue-500' :
                                  structureData.mean_plddt >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }>
                                  {structureData.mean_plddt ? structureData.mean_plddt.toFixed(1) : 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {getPlddtConfidenceLabel(structureData.mean_plddt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Experimental structure specific metrics */}
                        {structureData.source === 'experimental' && (
                          <div className="space-y-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Resolution</span>
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  !structureData.resolution ? 'bg-gray-300' :
                                  structureData.resolution <= 2.0 ? 'bg-green-500' :
                                  structureData.resolution <= 3.0 ? 'bg-blue-500' :
                                  structureData.resolution <= 4.0 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }>
                                  {structureData.resolution ? `${structureData.resolution.toFixed(2)}Å` : 'N/A'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Common metrics for all structure types */}
                        <MetricProgress
                          label="Ramachandran Outliers"
                          value={structureData.ramachandran_outliers}
                          thresholds={{ good: 0.5, medium: 2.0 }}
                          formatValue={(val) => `${val.toFixed(2)}%`}
                          inverse={true}
                          description="Percentage of residues with unusual backbone angles"
                        />
                        
                        <MetricProgress
                          label="Sidechain Outliers"
                          value={structureData.sidechain_outliers}
                          thresholds={{ good: 1.0, medium: 4.0 }}
                          formatValue={(val) => `${val.toFixed(2)}%`}
                          inverse={true}
                          description="Percentage of residues with unusual sidechain conformations"
                        />
                        
                        <MetricProgress
                          label="Clash Score"
                          value={structureData.clash_score}
                          thresholds={{ good: 6.0, medium: 15.0 }}
                          formatValue={(val) => val.toFixed(2)}
                          inverse={true}
                          description="Number of serious atom-atom overlaps per 1000 atoms"
                        />
                        
                        <div className="flex justify-between mt-3">
                          <span className="text-sm font-medium">Date Created</span>
                          <span className="text-sm">
                            {structureData.created_at ? new Date(structureData.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Structure Validation - only show when structure data is available */}
          {structureData && structureData.best_hit_tm_score && (
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setValidationExpanded(!validationExpanded)}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Validation & Comparison</CardTitle>
                  {validationExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </CardHeader>
              
              {validationExpanded && (
                <CardContent>
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Experimental Structure Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Table>
                          <TableBody className="text-sm">
                            <TableRow>
                              <TableCell className="font-medium">Best Experimental Match</TableCell>
                              <TableCell>{structureData.best_experimental_hit_pdb || 'N/A'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">TM-Score</TableCell>
                              <TableCell>
                                <Badge className={
                                  !structureData.best_hit_tm_score ? 'bg-gray-300' :
                                  structureData.best_hit_tm_score >= 0.8 ? 'bg-green-500' :
                                  structureData.best_hit_tm_score >= 0.5 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }>
                                  {structureData.best_hit_tm_score ? structureData.best_hit_tm_score.toFixed(2) : 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500 ml-2">
                                  {structureData.best_hit_tm_score >= 0.8 ? '(Same fold)' :
                                  structureData.best_hit_tm_score >= 0.5 ? '(Similar fold)' :
                                  structureData.best_hit_tm_score ? '(Different fold)' : ''}
                                </span>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">RMSD</TableCell>
                              <TableCell>
                                <Badge className={
                                  !structureData.best_hit_rmsd ? 'bg-gray-300' :
                                  structureData.best_hit_rmsd <= 2.0 ? 'bg-green-500' :
                                  structureData.best_hit_rmsd <= 4.0 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }>
                                  {structureData.best_hit_rmsd ? `${structureData.best_hit_rmsd.toFixed(2)}Å` : 'N/A'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Sequence Identity</TableCell>
                              <TableCell>
                                {structureData.best_hit_seq_identity ? 
                                  `${(structureData.best_hit_seq_identity * 100).toFixed(1)}%` : 
                                  'N/A'
                                }
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Validation Date</TableCell>
                              <TableCell>
                                {structureData.experimental_validation_date ? 
                                  new Date(structureData.experimental_validation_date).toLocaleDateString() : 
                                  'N/A'
                                }
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex items-center justify-center bg-gray-50 rounded-md p-4">
                        <div className="text-center">
                          <div className="mb-2 text-gray-500">Structure Comparison Visualization</div>
                          <p className="text-sm text-gray-500">
                            A superposition comparison would be displayed here
                          </p>
                          {/* This would be replaced with actual visualization in a real implementation */}
                          <div className="mt-4">
                            <Button variant="outline" size="sm" disabled>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Compare Structures
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Overall assessment */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-base font-medium mb-2">Overall Assessment</h3>
                      <p className="text-sm">
                        {structureData.source === 'alphafold' ? (
                          <>
                            This structure is an AlphaFold prediction with 
                            {structureData.mean_plddt && structureData.mean_plddt >= 90 ? ' very high confidence scores' : 
                            structureData.mean_plddt && structureData.mean_plddt >= 70 ? ' high confidence scores' : 
                            structureData.mean_plddt && structureData.mean_plddt >= 50 ? ' medium confidence scores' : 
                            ' low confidence scores'}.
                            {structureData.best_hit_tm_score >= 0.8 ? 
                              ' The model shows excellent agreement with experimental structures.' : 
                            structureData.best_hit_tm_score >= 0.5 ? 
                              ' The model shows good agreement with experimental structures.' : 
                              ' The model shows some differences compared to experimental structures.'}
                          </>
                        ) : structureData.source === 'experimental' ? (
                          <>
                            This structure is derived from experimental data 
                            {structureData.resolution ? 
                              ` with a resolution of ${structureData.resolution.toFixed(2)}Å.` : 
                              '.'}
                            {structureData.ramachandran_outliers <= 0.5 && structureData.sidechain_outliers <= 1.0 ? 
                              ' The structure shows excellent geometry and few outliers.' : 
                              ' The structure quality metrics are within acceptable ranges.'}
                          </>
                        ) : (
                          'Structure assessment information not available.'
                        )}
                      </p>
                      
                      {/* Notes section */}
                      {structureData.notes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium">Notes:</h4>
                          <p className="text-xs mt-1">{structureData.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          {/* Download options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1" 
                  disabled={!structureData || !pdbUrl}
                  onClick={handleDownloadStructure}
                >
                  <Download size={16} />
                  <span>Download PDB</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1" 
                  disabled={!domain}
                >
                  <FileText size={16} />
                  <span>View Sequence</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1" 
                  disabled={!structureData}
                >
                  <Download size={16} />
                  <span>Download Current View</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StructureTab;