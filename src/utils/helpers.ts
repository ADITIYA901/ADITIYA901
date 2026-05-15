import { format, formatDistanceToNow, differenceInSeconds, isAfter, isBefore, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getElectionStatus(startDate: string, endDate: string): 'upcoming' | 'active' | 'ended' {
  const now = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isBefore(now, start)) return 'upcoming';
  if (isAfter(now, end)) return 'ended';
  return 'active';
}

export function getCountdown(targetDate: string): { days: number; hours: number; minutes: number; seconds: number } {
  const target = parseISO(targetDate);
  const now = new Date();
  const totalSeconds = differenceInSeconds(target, now);

  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function generateBlockNumber(): number {
  return Math.floor(Math.random() * 10000000) + 18000000;
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function validateAadhaar(aadhaar: string): boolean {
  const cleaned = aadhaar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleaned);
}

export function formatAadhaar(aadhaar: string): string {
  const cleaned = aadhaar.replace(/\s/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; strength: number; message: string } {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const messages = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return {
    valid: strength >= 3,
    strength,
    message: messages[strength - 1] || 'Too Short',
  };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}
