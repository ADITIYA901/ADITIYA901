import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizes[size])} />
      {text && <p className="text-sm text-dark-500 dark:text-dark-400">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-800" />
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        </div>
        <p className="text-dark-500 dark:text-dark-400 font-medium">Loading BlockVote...</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-dark-200 dark:bg-dark-700 rounded-lg', className)} />
  );
}
