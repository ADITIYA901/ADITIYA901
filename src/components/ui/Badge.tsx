import { type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  variant?: 'upcoming' | 'active' | 'ended' | 'verified' | 'pending' | 'rejected' | 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'info', children, className }: BadgeProps) {
  const variants = {
    upcoming: 'badge-upcoming',
    active: 'badge-active',
    ended: 'badge-ended',
    verified: 'badge-verified',
    pending: 'badge-pending',
    rejected: 'badge-rejected',
    info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
    success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
    warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
    error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-400',
  };

  return <span className={cn(variants[variant], className)}>{children}</span>;
}
