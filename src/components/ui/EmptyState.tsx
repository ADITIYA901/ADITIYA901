import { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="text-dark-300 dark:text-dark-600 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300">{title}</h3>
      {description && <p className="text-sm text-dark-500 dark:text-dark-400 mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
