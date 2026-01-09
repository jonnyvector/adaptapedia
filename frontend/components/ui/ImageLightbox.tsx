'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { BORDERS } from '@/lib/brutalist-design';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps): JSX.Element {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 text-white hover:text-white/70 transition-colors bg-black border ${BORDERS.solid} border-white rounded-full w-10 h-10 flex items-center justify-center text-2xl`}
        aria-label="Close lightbox"
      >
        ×
      </button>

      {/* Image - prevent click propagation so clicking image doesn't close modal */}
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        className="max-w-full max-h-full object-contain cursor-default"
        onClick={(e) => e.stopPropagation()}
        unoptimized
      />
    </div>
  );
}
