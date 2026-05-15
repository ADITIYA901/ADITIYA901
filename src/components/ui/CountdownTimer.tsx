import { useState, useEffect } from 'react';
import { getCountdown } from '../../utils/helpers';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function CountdownTimer({ targetDate, onComplete, size = 'md' }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdown = getCountdown(targetDate);
      setCountdown(newCountdown);

      if (newCountdown.days === 0 && newCountdown.hours === 0 && newCountdown.minutes === 0 && newCountdown.seconds === 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  const sizes = {
    sm: { box: 'w-12 h-12 text-lg', label: 'text-[10px]' },
    md: { box: 'w-16 h-16 text-2xl', label: 'text-xs' },
    lg: { box: 'w-20 h-20 text-3xl', label: 'text-sm' },
  };

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hours' },
    { value: countdown.minutes, label: 'Mins' },
    { value: countdown.seconds, label: 'Secs' },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className={`${sizes[size].box} flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 font-mono font-bold text-primary-700 dark:text-primary-300`}>
              {String(unit.value).padStart(2, '0')}
            </div>
            <span className={`${sizes[size].label} text-dark-500 dark:text-dark-400 mt-1 font-medium`}>
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-primary-400 dark:text-primary-600 font-bold text-xl -mt-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
