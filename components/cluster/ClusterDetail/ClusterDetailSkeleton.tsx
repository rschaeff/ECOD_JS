// components/cluster/ClusterDetail/ClusterDetailSkeleton.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const ClusterDetailSkeleton = () => {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-6 w-40 mb-4" /> {/* Back link */}
        <Skeleton className="h-10 w-80 mb-2" /> {/* Title */}
        <Skeleton className="h-5 w-96 mb-2" /> {/* Subtitle */}
        <Skeleton className="h-6 w-24" /> {/* Badge */}
      </div>
      
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-3 lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-48 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-7 w-64 mb-2" />
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-8 w-32 mt-2" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-3" />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-32 mt-3 mb-1" />
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-7 w-48 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <Skeleton className="h-20 w-20 rounded-full mb-3" />
              <Skeleton className="h-4 w-full max-w-xs mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full max-w-2xl mb-6" />
      
      {/* Tab content skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-80" />
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClusterDetailSkeleton;