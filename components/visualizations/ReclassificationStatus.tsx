import React from 'react';
import { RefreshCw, AlertTriangle, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import Link from 'next/link';
import { useReclassificationStats } from '@/hooks/useReclassificationStats';

interface ReclassificationStatusProps {
  className?: string;
  showRecentActivity?: boolean;
}

const ReclassificationStatus: React.FC<ReclassificationStatusProps> = ({
  className,
  showRecentActivity = true
}) => {
  const { 
    data, 
    loading, 
    error, 
    refresh, 
    refreshing,
    timeRange,
    setTimeRange
  } = useReclassificationStats();

  // Colors for charts
  const COLORS = {
    pending: '#FFBB28',  // Yellow
    completed: '#00C49F', // Green
    rejected: '#FF8042',  // Orange
    auto: '#8884d8',     // Purple
    manual: '#82ca9d'    // Light green
  };

  // Format status badge
  const getStatusBadge = (status: 'pending' | 'completed' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-orange-500">Rejected</Badge>;
    }
  };

  // Format confidence badge
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case 'high':
        return <Badge className="bg-green-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-red-500">Low</Badge>;
      default:
        return <Badge className="bg-gray-500">{confidence}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={className} data-testid="reclassification-status">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Reclassification Status</CardTitle>
            <CardDescription>
              Overview of domain classification changes
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select 
              value={timeRange} 
              onValueChange={(val) => setTimeRange(val as any)}
              disabled={loading || refreshing}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refresh}
              disabled={refreshing || loading}
              data-testid="refresh-reclassification-btn"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing || loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          // Loading skeleton
          <div className="space-y-6" data-testid="reclassification-loading">
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            {showRecentActivity && (
              <Skeleton className="h-32 w-full" />
            )}
          </div>
        ) : error ? (
          // Error state
          <div className="p-4 bg-red-50 rounded-md text-red-700" data-testid="reclassification-error">
            <AlertTriangle className="h-5 w-5 mb-2" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? 'Trying again...' : 'Try Again'}
            </Button>
          </div>
        ) : (
          // Content
          <div data-testid="reclassification-content">
            <Tabs defaultValue="overview">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="overview">Status Overview</TabsTrigger>
                <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="flex justify-center mb-4">
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Pending', value: data?.totalPending || 0, fill: COLORS.pending },
                            { name: 'Completed', value: data?.totalCompleted || 0, fill: COLORS.completed },
                            { name: 'Rejected', value: data?.totalRejected || 0, fill: COLORS.rejected }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="pending" fill={COLORS.pending} />
                          <Cell key="completed" fill={COLORS.completed} />
                          <Cell key="rejected" fill={COLORS.rejected} />
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [value.toLocaleString(), 'Clusters']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Summary metrics */}
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="p-2 border rounded-md">
                    <div className="text-yellow-500 mb-1">
                      <Clock className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                    <div className="text-xl font-semibold">{data?.totalPending}</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="text-green-500 mb-1">
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                    <div className="text-xl font-semibold">{data?.totalCompleted}</div>
                  </div>
                  <div className="p-2 border rounded-md">
                    <div className="text-orange-500 mb-1">
                      <XCircle className="h-5 w-5 mx-auto" />
                    </div>
                    <div className="text-sm text-gray-500">Rejected</div>
                    <div className="text-xl font-semibold">{data?.totalRejected}</div>
                  </div>
                </div>
                
                {/* Confidence distribution */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Confidence Distribution</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {data?.confidenceDistribution.map(item => (
                      <div key={item.level} className="text-center">
                        <div className={`
                          text-xs font-medium rounded-full py-1 px-2
                          ${item.level === 'high' ? 'bg-green-100 text-green-800' : 
                            item.level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}
                        `}>
                          {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                        </div>
                        <div className="mt-1 text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="mt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="pending" name="Pending" fill={COLORS.pending} />
                      <Bar dataKey="completed" name="Completed" fill={COLORS.completed} />
                      <Bar dataKey="rejected" name="Rejected" fill={COLORS.rejected} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Top reclassification patterns */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Top Reclassification Patterns</h4>
                  {data?.topTGroups.length ? (
                    <div className="space-y-2">
                      {data.topTGroups.map((group, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                          <div className="text-sm">
                            <span className="text-gray-800">{group.from}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span className="text-blue-600">{group.to}</span>
                          </div>
                          <Badge>{group.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No reclassification patterns available
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Recent Activity */}
            {showRecentActivity && data?.recentActivity.length ? (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {data.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="p-2 border rounded-md hover:bg-gray-50">
                      <div className="flex justify-between">
                        <Link href={`/clusters/${activity.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {activity.name}
                        </Link>
                        <div className="flex space-x-1">
                          {getStatusBadge(activity.status)}
                          {getConfidenceBadge(activity.confidence)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span>{activity.fromTGroup}</span>
                        <span className="mx-1">→</span>
                        <span className="text-blue-600">{activity.toTGroup}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <div className="text-gray-400">
                          <Calendar className="h-3 w-3 inline-block mr-1" />
                          {formatDate(activity.date)}
                        </div>
                        {activity.user && (
                          <div className="text-gray-500">
                            by {activity.user}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/reclassifications" className="text-blue-600 hover:text-blue-800 text-sm">
          View all reclassifications
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ReclassificationStatus;