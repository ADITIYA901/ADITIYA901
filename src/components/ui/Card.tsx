import { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = false, gradient = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card p-6',
        hover && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        gradient && 'gradient-border',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {gradient ? <div className="bg-white dark:bg-dark-800 rounded-2xl p-6">{children}</div> : children}
    </div>
  );
}

export function StatCard({
  icon,
  value,
  label,
  trend,
  trendValue,
  color = 'primary',
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error';
}) {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
  };

  const trendColor = trend === 'up' ? 'text-success-500' : trend === 'down' ? 'text-error-500' : 'text-dark-400';

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} text-white`}>
          {icon}
        </div>
        {trend && trendValue && (
          <span className={cn('text-sm font-medium flex items-center gap-1', trendColor)}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}
            {trendValue}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-dark-900 dark:text-white">{value}</p>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
