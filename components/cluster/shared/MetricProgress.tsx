// components/cluster/shared/MetricProgress.tsx
import { Badge } from '@/components/ui/badge';

interface MetricProgressProps {
  label: string;
  value: number | null | undefined;
  description?: string;
  thresholds?: {
    good: number;
    medium: number;
  };
  formatValue?: (val: number) => string;
  inverse?: boolean; // If true, lower values are better
}

// Default formatter for percentage values
const defaultFormatter = (val: number) => `${(val * 100).toFixed(1)}%`;

const MetricProgress: React.FC<MetricProgressProps> = ({
  label,
  value,
  description,
  thresholds = { good: 0.8, medium: 0.5 },
  formatValue = defaultFormatter,
  inverse = false
}) => {
  if (value === null || value === undefined) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-medium">N/A</span>
        </div>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  }
  
  // Determine color based on thresholds
  let color;
  if (inverse) {
    color = value <= thresholds.good ? "bg-green-600" :
            value <= thresholds.medium ? "bg-yellow-500" :
            "bg-red-500";
  } else {
    color = value >= thresholds.good ? "bg-green-600" :
            value >= thresholds.medium ? "bg-yellow-500" :
            "bg-red-500";
  }
  
  // Badge color for the value
  const badgeColor = color.replace("bg-", "");
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <Badge className={color}>
          {formatValue(value)}
        </Badge>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${Math.min(100, value * 100)}%` }}
        ></div>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};

export default MetricProgress;