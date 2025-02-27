// components/dashboard/DomainStructureTab
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, FileText, ChevronDown, ChevronUp, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MoleculeViewer from '@/components/MoleculeViewer';

const DomainStructureTab = ({ 
  domain, 
  structureData = null,
  isLoading = false,
  onRefresh = () => {}
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(true);
  const [validationExpanded, setValidationExpanded] = useState(true);
  const [error, setError] = useState(null);
  const [pdbUrl, setPdbUrl] = useState(null);
  
  // Extract structure data from the domain or from the separate structureData prop
  const structureInfo = structureData || (domain?.structure || null);
  
  // Effect to format the PDB URL correctly
  useEffect(() => {
    if (structureInfo?.file_path) {
      // For real implementation, you would point to your API or static files
      // This is a placeholder that would be replaced with your actual PDB file path
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      setPdbUrl(`${apiBaseUrl}/structures/file?path=${encodeURIComponent(structureInfo.file_path)}`);
    } else {
      setPdbUrl(null);
    }
  }, [structureInfo]);
  
  // Handle full screen toggle
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    // In a real implementation, you might want to also handle browser full screen API
  };
  
  // Format quality metrics
  const formatQualityMetric = (value, good, medium) => {
    if (value === null || value === undefined) return { value: 'N/A', color: 'bg-gray-300' };
    
    const formatted = typeof value === 'number' && !isNaN(value) 
      ? value.toFixed(2) 
      : String(value);
    
    let color = 'bg-red-500';
    if (value <= good) color = 'bg-green-500';
    else if (value <= medium) color = 'bg-yellow-500';
    
    return { value: formatted, color };
  };
  
  // Calculate structure source label
  const getStructureSourceLabel = () => {
    if (!structureInfo) return { label: 'Unknown', color: 'bg-gray-500' };
    
    switch (structureInfo.source) {
      case 'alphafold':
        return { 
          label: `AlphaFold${structureInfo.source_version ? ` (${structureInfo.source_version})` : ''}`, 
          color: 'bg-blue-500'
        };
      case 'experimental':
        return { 
          label: `Experimental${structureInfo.resolution ? ` (${structureInfo.resolution}Å)` : ''}`, 
          color: 'bg-green-500'
        };
      case 'custom':
        return { label: 'Custom Model', color: 'bg-purple-500' };
      default:
        return { label: structureInfo.source, color: 'bg-gray-500' };
    }
  };
  
  const sourceInfo = getStructureSourceLabel();
  
  // Format quality metrics
  const ramachandranMetric = formatQualityMetric(
    structureInfo?.ramachandran_outliers, 
    0.5,  // Good threshold
    2.0   // Medium threshold
  );
  
  const sidechainMetric = formatQualityMetric(
    structureInfo?.sidechain_outliers,
    1.0,  // Good threshold
    4.0   // Medium threshold
  );
  
  const clashScoreMetric = formatQualityMetric(
    structureInfo?.clash_score,
    6.0,  // Good threshold
    15.0  // Medium threshold
  );
  
  const plddt = structureInfo?.mean_plddt;
  const plddtBadge = !plddt ? 'bg-gray-300' :
    plddt >= 90 ? 'bg-green-500' :
    plddt >= 70 ? 'bg-blue-500' :
    plddt >= 50 ? 'bg-yellow-500' :
    'bg-red-500';
  
  return (
    <div className="space-y-6">
      {/* Structure Viewer */}
      <MoleculeViewer
        pdbId={null}  // We'll use pdbUrl instead
        pdbUrl={pdbUrl}
        title={`Domain Structure: ${domain?.domain_id || 'Loading...'}`}
        description={structureInfo 
          ? `${sourceInfo.label} structure for ${domain?.domain_id || ''} (${domain?.unp_acc || ''})`
          : "No structure data available"
        }
        initialRenderStyle="cartoon"
        height="550px"
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
        isLoading={isLoading || !pdbUrl}
      />
      
      {!isFullScreen && (
        <>
          {/* Structure Metadata */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setMetadataExpanded(!metadataExpanded)}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  Structure Metadata
                  <Badge className={sourceInfo.color}>{sourceInfo.label}</Badge>
                </CardTitle>
                {metadataExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            
            {metadataExpanded && (
              <CardContent>
                {!structureInfo ? (
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
                            <TableCell>{domain?.domain_id || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">UniProt Acc</TableCell>
                            <TableCell>{domain?.unp_acc || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Residue Range</TableCell>
                            <TableCell>{domain?.range || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Source</TableCell>
                            <TableCell>{structureInfo.source || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">File Type</TableCell>
                            <TableCell>{structureInfo.file_type || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">File Path</TableCell>
                            <TableCell className="truncate max-w-xs">{structureInfo.file_path || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Quality Metrics</h3>
                      <Table>
                        <TableBody className="text-sm">
                          {structureInfo.source === 'alphafold' && (
                            <TableRow>
                              <TableCell className="font-medium">Mean pLDDT</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge className={plddtBadge}>
                                    {plddt ? plddt.toFixed(1) : 'N/A'}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {plddt >= 90 ? '(Very high confidence)' :
                                     plddt >= 70 ? '(High confidence)' :
                                     plddt >= 50 ? '(Medium confidence)' :
                                     plddt ? '(Low confidence)' : ''}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          {structureInfo.source === 'experimental' && (
                            <TableRow>
                              <TableCell className="font-medium">Resolution</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge className={
                                    !structureInfo.resolution ? 'bg-gray-300' :
                                    structureInfo.resolution <= 2.0 ? 'bg-green-500' :
                                    structureInfo.resolution <= 3.0 ? 'bg-blue-500' :
                                    structureInfo.resolution <= 4.0 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }>
                                    {structureInfo.resolution ? `${structureInfo.resolution.toFixed(2)}Å` : 'N/A'}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                          
                          <TableRow>
                            <TableCell className="font-medium">Ramachandran Outliers</TableCell>
                            <TableCell>
                              <Badge className={ramachandranMetric.color}>
                                {ramachandranMetric.value}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell className="font-medium">Sidechain Outliers</TableCell>
                            <TableCell>
                              <Badge className={sidechainMetric.color}>
                                {sidechainMetric.value}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell className="font-medium">Clash Score</TableCell>
                            <TableCell>
                              <Badge className={clashScoreMetric.color}>
                                {clashScoreMetric.value}
                              </Badge>
                            </TableCell>
                          </TableRow>
                          
                          <TableRow>
                            <TableCell className="font-medium">Date Created</TableCell>
                            <TableCell>
                              {structureInfo.created_at ? new Date(structureInfo.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Structure Validation */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setValidationExpanded(!validationExpanded)}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Validation & Comparison</CardTitle>
                {validationExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </CardHeader>
            
            {validationExpanded && (
              <CardContent>
                {!structureInfo || !structureInfo.best_hit_tm_score ? (
                  <div className="text-center py-6 text-gray-500">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>No validation data available for this domain structure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Experimental Structure Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Table>
                          <TableBody className="text-sm">
                            <TableRow>
                              <TableCell className="font-medium">Best Experimental Match</TableCell>
                              <TableCell>{structureInfo.best_experimental_hit_pdb || 'N/A'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">TM-Score</TableCell>
                              <TableCell>
                                <Badge className={
                                  !structureInfo.best_hit_tm_score ? 'bg-gray-300' :
                                  structureInfo.best_hit_tm_score >= 0.8 ? 'bg-green-500' :
                                  structureInfo.best_hit_tm_score >= 0.5 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }>
                                  {structureInfo.best_hit_tm_score ? structureInfo.best_hit_tm_score.toFixed(2) : 'N/A'}
                                </Badge>
                                <span className="text-xs text-gray-500 ml-2">
                                  {structureInfo.best_hit_tm_score >= 0.8 ? '(Same fold)' :
                                   structureInfo.best_hit_tm_score >= 0.5 ? '(Similar fold)' :
                                   structureInfo.best_hit_tm_score ? '(Different fold)' : ''}
                                </span>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">RMSD</TableCell>
                              <TableCell>
                                <Badge className={
                                  !structureInfo.best_hit_rmsd ? 'bg-gray-300' :
                                  structureInfo.best_hit_rmsd <= 2.0 ? 'bg-green-500' :
                                  structureInfo.best_hit_rmsd <= 4.0 ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }>
                                  {structureInfo.best_hit_rmsd ? `${structureInfo.best_hit_rmsd.toFixed(2)}Å` : 'N/A'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Sequence Identity</TableCell>
                              <TableCell>
                                {structureInfo.best_hit_seq_identity ? 
                                  `${(structureInfo.best_hit_seq_identity * 100).toFixed(1)}%` : 
                                  'N/A'
                                }
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Validation Date</TableCell>
                              <TableCell>
                                {structureInfo.experimental_validation_date ? 
                                  new Date(structureInfo.experimental_validation_date).toLocaleDateString() : 
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
                    
                    {/* Additional validation info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-base font-medium mb-2">Overall Assessment</h3>
                      <p className="text-sm">
                        {structureInfo.source === 'alphafold' ? (
                          <>
                            This structure is an AlphaFold prediction with 
                            {plddt >= 90 ? ' very high confidence scores' : 
                             plddt >= 70 ? ' high confidence scores' : 
                             plddt >= 50 ? ' medium confidence scores' : 
                             ' low confidence scores'}.
                            {structureInfo.best_hit_tm_score >= 0.8 ? 
                              ' The model shows excellent agreement with experimental structures.' : 
                             structureInfo.best_hit_tm_score >= 0.5 ? 
                              ' The model shows good agreement with experimental structures.' : 
                              ' The model shows some differences compared to experimental structures.'}
                          </>
                        ) : structureInfo.source === 'experimental' ? (
                          <>
                            This structure is derived from experimental data 
                            {structureInfo.resolution ? 
                              ` with a resolution of ${structureInfo.resolution.toFixed(2)}Å.` : 
                              '.'}
                            {structureInfo.ramachandran_outliers <= 0.5 && structureInfo.sidechain_outliers <= 1.0 ? 
                              ' The structure shows excellent geometry and few outliers.' : 
                              ' The structure quality metrics are within acceptable ranges.'}
                          </>
                        ) : (
                          'Structure assessment information not available.'
                        )}
                      </p>
                      
                      {/* Notes section */}
                      {structureInfo.notes && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium">Notes:</h4>
                          <p className="text-xs mt-1">{structureInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          {/* Download section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="flex items-center gap-1" disabled={!structureInfo}>
                  <Download size={16} />
                  <span>Download PDB</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-1" disabled={!structureInfo}>
                  <FileText size={16} />
                  <span>View Sequence</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-1" disabled={!structureInfo}>
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

export default DomainStructureTab;