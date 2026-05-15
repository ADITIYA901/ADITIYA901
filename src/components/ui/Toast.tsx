import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        },
      }}
    />
  );
}
