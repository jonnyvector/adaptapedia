import { useState, useEffect } from 'react';

interface ColorResult {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

const CACHE_PREFIX = 'img_color_v2_'; // v2 to bust old cache
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Extract average color from an image using Canvas API
 */
function getAverageColor(img: HTMLImageElement): { r: number; g: number; b: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { r: 248, g: 250, b: 252 }; // Fallback
  }

  // Use a small canvas for better performance
  const sampleSize = 50;
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  // Draw image scaled down
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imageData.data;

  let r = 0, g = 0, b = 0;
  let count = 0;

  // Sample every pixel
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];
    const alpha = data[i + 3];

    // Skip transparent pixels
    if (alpha > 128) {
      r += red;
      g += green;
      b += blue;
      count++;
    }
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count)
  };
}

/**
 * Extract dominant color from an image and cache the result
 * Returns a muted, light variant suitable for subtle backgrounds
 */
export function useImageColor(imageUrl: string | undefined): ColorResult | null {
  const [color, setColor] = useState<ColorResult | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setColor(null);
      return;
    }

    // Check cache first
    const cacheKey = CACHE_PREFIX + imageUrl;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { color: cachedColor, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        if (age < CACHE_EXPIRY) {
          setColor(cachedColor);
          return;
        }
      } catch (e) {
        // Invalid cache, continue to extraction
      }
    }

    // Extract color
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        // Get average color from image
        const { r, g, b } = getAverageColor(img);

        // Lighten the color significantly for background use
        // Mix with white (255, 255, 255) at 20% white / 80% color for VERY visible tint (testing)
        const lightR = Math.round(r * 0.80 + 255 * 0.20);
        const lightG = Math.round(g * 0.80 + 255 * 0.20);
        const lightB = Math.round(b * 0.80 + 255 * 0.20);

        const result: ColorResult = {
          hex: `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`,
          rgb: { r: lightR, g: lightG, b: lightB }
        };

        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          color: result,
          timestamp: Date.now()
        }));

        setColor(result);
      } catch (err) {
        console.error('Failed to process image color:', err);
        setColor({
          hex: '#f8fafc',
          rgb: { r: 248, g: 250, b: 252 }
        });
      }
    };

    img.onerror = () => {
      // CORS or loading error - use neutral fallback
      setColor({
        hex: '#f8fafc',
        rgb: { r: 248, g: 250, b: 252 }
      });
    };

    // Start loading
    img.src = imageUrl;
  }, [imageUrl]);

  return color;
}
