import { User } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover border-2 border-white dark:border-dark-700 shadow-sm', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold shadow-sm',
        sizes[size],
        className
      )}
    >
      {initials || <User className="w-1/2 h-1/2" />}
    </div>
  );
}
