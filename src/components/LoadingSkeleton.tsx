import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'list';
  rows?: number;
}

export function LoadingSkeleton({ type = 'card', rows = 3 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="w-full h-4 mb-2 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="w-3/4 h-6 mb-2 bg-gray-200 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-200">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}