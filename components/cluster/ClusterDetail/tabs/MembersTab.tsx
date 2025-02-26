// components/cluster/ClusterDetail/tabs/MembersTab.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClusterMembers } from '@/hooks/cluster';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';

interface MembersTabProps {
  clusterId: number;
  onDomainSelect: (domain: any) => void;
}

// Format for percentage display
const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
};

const MembersTabSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-5 w-72" />
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16" /></TableHead>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 7 }).map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-5 w-64" />
    </CardFooter>
  </Card>
);

const MembersTab: React.FC<MembersTabProps> = ({ clusterId, onDomainSelect }) => {
  const { 
    members, 
    loading, 
    error, 
    totalCount, 
    page, 
    setPage, 
    pageSize,
    pageCount,
    refetch 
  } = useClusterMembers(clusterId);
  
  // Handle export to CSV
  const handleExportCsv = () => {
    if (!members.length) return;
    
    // Create CSV content
    const headers = ['Domain ID', 'UniProt Acc', 'T-Group', 'Range', 'Sequence Identity', 'Representative'];
    const rows = members.map(member => [
      member.domain.domain_id,
      member.domain.unp_acc,
      member.domain.t_group,
      member.domain.range,
      formatPercentage(member.sequence_identity),
      member.is_representative ? 'Yes' : 'No'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cluster_${clusterId}_members.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <MembersTabSkeleton />;
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cluster Members</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-red-500 mb-4">Failed to load cluster members</div>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cluster Members</CardTitle>
          <CardDescription>
            All domains that belong to this cluster sorted by sequence identity to representative
          </CardDescription>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain ID</TableHead>
                <TableHead>UniProt Acc</TableHead>
                <TableHead>T-Group</TableHead>
                <TableHead>Range</TableHead>
                <TableHead className="text-right">Sequence Identity</TableHead>
                <TableHead className="text-center">Representative</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className={member.is_representative ? "bg-blue-50" : ""}>
                  <TableCell className="font-medium">{member.domain.domain_id}</TableCell>
                  <TableCell>{member.domain.unp_acc}</TableCell>
                  <TableCell>{member.domain.t_group}</TableCell>
                  <TableCell>{member.domain.range}</TableCell>
                  <TableCell className="text-right">{formatPercentage(member.sequence_identity)}</TableCell>
                  <TableCell className="text-center">
                    {member.is_representative && <Badge className="bg-blue-500">✓</Badge>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-600"
                      onClick={() => onDomainSelect(member.domain)}
                    >
                      View Structure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Pagination */}
      {pageCount > 1 && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} members
          </div>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              // Calculate page numbers to show
              let pageNum = i + 1;
              if (pageCount > 5 && page > 3) {
                pageNum = page - 2 + i;
              }
              if (pageNum > pageCount) return null;
              
              return (
                <Button 
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(Math.min(pageCount, page + 1))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default MembersTab;