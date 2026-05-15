import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full glass-card p-6 animate-scale-in z-10', sizes[size])}>
        {(title || showClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && <h3 className="text-lg font-semibold text-dark-900 dark:text-white">{title}</h3>}
            {showClose && (
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors">
                <X className="w-5 h-5 text-dark-500" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
