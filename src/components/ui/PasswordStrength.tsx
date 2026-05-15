import { cn, validatePassword } from '../../utils/helpers';

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { strength, message, valid } = validatePassword(password);

  if (!password) return null;

  const colors = ['bg-error-500', 'bg-error-400', 'bg-warning-400', 'bg-success-400', 'bg-success-500'];
  const textColors = ['text-error-500', 'text-error-400', 'text-warning-500', 'text-success-500', 'text-success-600'];

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              strength >= level ? colors[strength - 1] : 'bg-dark-200 dark:bg-dark-700'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', textColors[strength - 1] || 'text-dark-400')}>
        {message}
      </p>
    </div>
  );
}
