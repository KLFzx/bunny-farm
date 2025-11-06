import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  title: string;
  value: number;
  max?: number;
  icon: React.ReactNode;
  colorClass: string;
  showProgress?: boolean;
}

export const ResourceCard = ({
  title,
  value,
  max,
  icon,
  colorClass,
  showProgress = false,
}: ResourceCardProps) => {
  const percentage = max ? (value / max) * 100 : 0;
  
  return (
    <Card className={cn(
      "p-6 shadow-card hover:shadow-soft transition-all duration-300 hover:scale-105",
      colorClass
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{icon}</div>
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-2xl font-bold">
              {value}
              {max && <span className="text-base opacity-70">/{max}</span>}
            </p>
          </div>
        </div>
      </div>
      
      {showProgress && max && (
        <Progress 
          value={percentage} 
          className="h-2"
        />
      )}
    </Card>
  );
};
