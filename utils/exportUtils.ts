// utils/exportUtils.ts
import { ClusterDetail } from '@/services/api';

/**
 * Creates and downloads a CSV file with cluster member data
 */
export const exportClusterData = (clusterData: ClusterDetail) => {
  // Prepare data for CSV
  const rows = [
    // Header row
    ['Domain ID', 'UniProt Acc', 'T-Group', 'Range', 'Sequence Identity', 'Is Representative'],
    
    // Data rows
    ...clusterData.members.map(member => [
      member.domain?.domain_id || '',
      member.domain?.unp_acc || '',
      member.domain?.t_group || '',
      member.domain?.range || '',
      (member.sequence_identity * 100).toFixed(1) + '%',
      member.is_representative ? 'Yes' : 'No'
    ])
  ];
  
  // Convert to CSV format
  const csvContent = rows.map(row => row.join(',')).join('\n');
  
  // Create a Blob with the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `cluster_${clusterData.cluster.cluster_number}_members.csv`;
  
  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};

/**
 * Exports cluster data as JSON
 */
export const exportClusterJson = (clusterData: ClusterDetail) => {
  // Create a Blob with the JSON data
  const blob = new Blob(
    [JSON.stringify(clusterData, null, 2)], 
    { type: 'application/json' }
  );
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `cluster_${clusterData.cluster.cluster_number}_data.json`;
  
  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};

/**
 * Exports alignment data in FASTA format
 */
export const exportMsaData = (msaData: string, clusterId: number | string) => {
  // Create a Blob with the MSA data
  const blob = new Blob([msaData], { type: 'text/plain' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `cluster_${clusterId}_alignment.fasta`;
  
  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};

/**
 * Exports domain sequence in FASTA format
 */
export const exportDomainSequence = (domainId: string, sequence: string) => {
  // Format as FASTA
  const fastaContent = `>${domainId}\n${sequence}`;
  
  // Create a Blob with the FASTA data
  const blob = new Blob([fastaContent], { type: 'text/plain' });
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${domainId}_sequence.fasta`;
  
  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};