// utils/exportUtils.ts
export const exportClusterData = (clusterData: any) => {
  if (!clusterData) return;

  const fileName = `cluster-${clusterData.cluster.cluster_number}-export.json`;
  const data = JSON.stringify(clusterData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};