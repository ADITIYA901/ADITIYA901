import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/helpers';

interface OTPVerificationProps {
  length?: number;
  onVerify: (otp: string) => void;
  onResend: () => void;
  isLoading?: boolean;
}

export default function OTPVerification({ length = 6, onVerify, onResend, isLoading = false }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '')) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e.key, i)}
            disabled={isLoading}
            className={cn(
              'w-12 h-12 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-dark-800 transition-all duration-200 focus:outline-none',
              digit
                ? 'border-primary-500 focus:ring-2 focus:ring-primary-500/50 text-primary-600 dark:text-primary-400'
                : 'border-dark-200 dark:border-dark-600 focus:ring-2 focus:ring-primary-500/50 text-dark-900 dark:text-dark-100'
            )}
          />
        ))}
      </div>
      <div className="text-center">
        {timer > 0 ? (
          <p className="text-sm text-dark-500 dark:text-dark-400">
            Resend OTP in <span className="font-mono font-medium text-primary-600 dark:text-primary-400">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={() => { onResend(); setTimer(30); }}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
