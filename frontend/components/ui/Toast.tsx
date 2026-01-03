'use client';

import { useEffect } from 'react';
import { FONTS, LETTER_SPACING, BORDERS, TEXT } from '@/lib/brutalist-design';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-black dark:bg-white border ${BORDERS.solid} rounded-md animate-slide-in-up`}
      style={{
        animation: 'slideInUp 0.3s ease-out',
        maxWidth: '90vw',
        width: 'auto',
      }}
    >
      <div className="flex items-center justify-center font-bold flex-shrink-0 text-white dark:text-black">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${TEXT.secondary} font-bold text-white dark:text-black break-words`} style={{ fontFamily: FONTS.mono }}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 dark:text-black/80 hover:text-white hover:dark:text-black transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
