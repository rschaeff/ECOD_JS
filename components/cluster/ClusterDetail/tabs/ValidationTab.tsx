// components/cluster/ClusterDetail/tabs/ValidationTab.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Info, Check, AlertTriangle, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClusterValidation } from '@/hooks/cluster';
import MetricProgress from '../../shared/MetricProgress';
import ErrorDisplay from '../../shared/ErrorDisplay';

interface ValidationTabProps {
  clusterId: number;
  activeTab: string;
}

const ValidationTab: React.FC<ValidationTabProps> = ({ clusterId, activeTab }) => {
  const { validationData, loading, error, refetch, statusColor } = useClusterValidation(
    clusterId, 
    activeTab === 'validation'
  );
  
  // Format for percentage display
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Handle export to CSV
  const handleExportCsv = () => {
    if (!validationData) return;
    
    // Create CSV content
    const csvContent = [
      'Metric,Value',
      `Structure Consistency,${formatPercentage(validationData.structuralValidation.structureConsistency)}`,
      `Experimental Support,${formatPercentage(validationData.structuralValidation.experimentalSupport)}`,
      `Taxonomic Diversity,${formatPercentage(validationData.taxonomicValidation.taxonomicDiversity)}`,
      `T-Group Homogeneity,${formatPercentage(validationData.taxonomicValidation.tgroupHomogeneity)}`,
      `Status,${validationData.classificationAssessment.status}`
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cluster_${clusterId}_validation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Get appropriate status icon
  const getStatusIcon = () => {
    if (!validationData) return <Info size={24} className="text-gray-400" />;
    
    switch (validationData.classificationAssessment.status) {
      case 'Valid':
        return <Check size={24} className="text-green-500" />;
      case 'Invalid': 
        return <X size={24} className="text-red-500" />;
      case 'Needs Review':
        return <AlertTriangle size={24} className="text-yellow-500" />;
      default:
        return <Info size={24} className="text-gray-400" />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cluster Validation Metrics</CardTitle>
          <CardDescription>Loading validation data...</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cluster Validation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorDisplay 
            error={error} 
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!validationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cluster Validation Metrics</CardTitle>
          <CardDescription>No validation data available</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center">
          <Info className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-600 mb-4">No validation data available for this cluster</p>
          <Button variant="outline" onClick={refetch}>
            Load Validation Data
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cluster Validation Metrics</CardTitle>
            <CardDescription>Analysis of cluster quality and classification confidence</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleExportCsv}
          >
            <Download size={16} />
            <span>Export CSV</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Structural Validation */}
            <div>
              <h3 className="text-lg font-medium mb-4">Structural Validation</h3>
              <div className="space-y-6">
                <MetricProgress
                  label="Structure Consistency"
                  value={validationData.structuralValidation.structureConsistency}
                  thresholds={{ good: 0.8, medium: 0.6 }}
                  description="Based on TM-score comparisons between all structures in cluster"
                />
                
                <MetricProgress
                  label="Experimental Support"
                  value={validationData.structuralValidation.experimentalSupport}
                  thresholds={{ good: 0.7, medium: 0.4 }}
                  description="Percentage of domains with experimental structure evidence"
                />
              </div>
              
              {/* Additional info about structural validation */}
              <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
                <p>
                  {validationData.structuralValidation.structureConsistency >= 0.8 
                    ? "The structures in this cluster show high consistency, indicating a well-defined fold."
                    : validationData.structuralValidation.structureConsistency >= 0.6
                    ? "The structures in this cluster show moderate consistency, with some structural variations."
                    : "The structures in this cluster show significant variations, suggesting potential classification issues."}
                </p>
              </div>
            </div>
            
            {/* Taxonomic Validation */}
            <div>
              <h3 className="text-lg font-medium mb-4">Taxonomic Validation</h3>
              <div className="space-y-6">
                <MetricProgress
                  label="Taxonomic Diversity"
                  value={validationData.taxonomicValidation.taxonomicDiversity}
                  thresholds={{ good: 0.7, medium: 0.4 }}
                  description="Weighted measure of taxonomy spread across the cluster"
                />
                
                <MetricProgress
                  label="T-Group Homogeneity"
                  value={validationData.taxonomicValidation.tgroupHomogeneity}
                  thresholds={{ good: 0.8, medium: 0.6 }}
                  description="Percentage of domains assigned to the most common T-group"
                />
              </div>
              
              {/* Additional info about taxonomic validation */}
              <div className="mt-6 p-3 bg-gray-50 rounded-md text-sm">
                <p>
                  {validationData.taxonomicValidation.tgroupHomogeneity >= 0.8 
                    ? "This cluster shows high T-group homogeneity, suggesting a coherent structural classification."
                    : validationData.taxonomicValidation.tgroupHomogeneity >= 0.6
                    ? "This cluster shows moderate T-group homogeneity, with some potential classification inconsistencies."
                    : "This cluster shows low T-group homogeneity, suggesting potential misclassification or a new fold family."}
                </p>
              </div>
            </div>
          </div>
          
          {/* Classification Assessment Box */}
          <div className="mt-8 p-6 bg-gray-50 rounded-md">
            <h3 className="text-xl font-medium mb-4">Classification Assessment</h3>
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold ${
                statusColor === 'green' ? 'bg-green-500' :
                statusColor === 'red' ? 'bg-red-500' :
                statusColor === 'yellow' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`}>
                <div className="flex flex-col items-center">
                  {getStatusIcon()}
                  <span className="mt-1 text-sm">
                    {validationData.classificationAssessment.status}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-base mb-4">
                  {validationData.classificationAssessment.notes}
                </p>
                
                {/* Recommendation based on validation status */}
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <h4 className="font-medium mb-2">Recommendation:</h4>
                  {validationData.classificationAssessment.status === 'Valid' ? (
                    <p className="text-sm">
                      This cluster appears to represent a valid evolutionary grouping. No further action is needed.
                    </p>
                  ) : validationData.classificationAssessment.status === 'Invalid' ? (
                    <p className="text-sm">
                      This cluster shows inconsistencies that suggest possible misclassification. 
                      Consider reviewing and potentially reclassifying the member domains.
                    </p>
                  ) : (
                    <p className="text-sm">
                      This cluster requires manual review to determine the appropriate classification.
                      Check the structural and taxonomic evidence to make a determination.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quality Table */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Validation Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Structure Consistency</TableCell>
                  <TableCell>{formatPercentage(validationData.structuralValidation.structureConsistency)}</TableCell>
                  <TableCell>
                    <Badge className={
                      validationData.structuralValidation.structureConsistency >= 0.8 ? 'bg-green-500' :
                      validationData.structuralValidation.structureConsistency >= 0.6 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }>
                      {validationData.structuralValidation.structureConsistency >= 0.8 ? 'Excellent' :
                       validationData.structuralValidation.structureConsistency >= 0.6 ? 'Good' :
                       'Moderate'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Experimental Support</TableCell>
                  <TableCell>{formatPercentage(validationData.structuralValidation.experimentalSupport)}</TableCell>
                  <TableCell>
                    <Badge className={
                      validationData.structuralValidation.experimentalSupport >= 0.7 ? 'bg-green-500' :
                      validationData.structuralValidation.experimentalSupport >= 0.4 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }>
                      {validationData.structuralValidation.experimentalSupport >= 0.7 ? 'Strong' :
                       validationData.structuralValidation.experimentalSupport >= 0.4 ? 'Moderate' :
                       'Limited'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Taxonomic Diversity</TableCell>
                  <TableCell>{formatPercentage(validationData.taxonomicValidation.taxonomicDiversity)}</TableCell>
                  <TableCell>
                    <Badge className={
                      validationData.taxonomicValidation.taxonomicDiversity >= 0.7 ? 'bg-green-500' :
                      validationData.taxonomicValidation.taxonomicDiversity >= 0.4 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }>
                      {validationData.taxonomicValidation.taxonomicDiversity >= 0.7 ? 'High' :
                       validationData.taxonomicValidation.taxonomicDiversity >= 0.4 ? 'Medium' :
                       'Low'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">T-Group Homogeneity</TableCell>
                  <TableCell>{formatPercentage(validationData.taxonomicValidation.tgroupHomogeneity)}</TableCell>
                  <TableCell>
                    <Badge className={
                      validationData.taxonomicValidation.tgroupHomogeneity >= 0.8 ? 'bg-green-500' :
                      validationData.taxonomicValidation.tgroupHomogeneity >= 0.6 ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }>
                      {validationData.taxonomicValidation.tgroupHomogeneity >= 0.8 ? 'High' :
                       validationData.taxonomicValidation.tgroupHomogeneity >= 0.6 ? 'Medium' :
                       'Low'}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Overall Assessment</TableCell>
                  <TableCell>{validationData.classificationAssessment.status}</TableCell>
                  <TableCell>
                    <Badge className={
                      validationData.classificationAssessment.status === 'Valid' ? 'bg-green-500' :
                      validationData.classificationAssessment.status === 'Invalid' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }>
                      {validationData.classificationAssessment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw size={16} className="mr-2" />
              Re-run Validation
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download size={16} className="mr-2" />
              Export Full Report
            </Button>
            {validationData.classificationAssessment.status !== 'Valid' && (
              <Button variant="outline" className="w-full justify-start text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                <AlertTriangle size={16} className="mr-2" />
                Flag for Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationTab;