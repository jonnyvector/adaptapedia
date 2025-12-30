"""Utility for extracting dominant colors from images."""
import io
import requests
from PIL import Image
from typing import Optional
from collections import Counter


def extract_dominant_color(image_url: str, lighten_percent: float = 0.50) -> Optional[str]:
    """
    Extract the dominant color from an image URL and return as hex.
    Uses color quantization to find the most prominent color.

    Args:
        image_url: URL of the image to process
        lighten_percent: How much to lighten (0.0-1.0, where 0.50 = 50% white / 50% color)

    Returns:
        Hex color string (e.g., "#e8f0f8") or None if extraction fails
    """
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()

        # Open image with Pillow
        img = Image.open(io.BytesIO(response.content))

        # Resize to small size for faster processing
        img = img.resize((100, 100), Image.Resampling.LANCZOS)

        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Quantize to reduce colors and find dominant ones
        img = img.quantize(colors=5, method=2)  # Reduce to 5 main colors

        # Convert back to RGB
        img = img.convert('RGB')

        # Get all pixels
        pixels = list(img.getdata())

        # Count pixel frequencies
        pixel_count = Counter(pixels)

        # Find the most saturated color (excludes black/white/gray)
        most_saturated = None
        max_saturation = 0

        for color, count in pixel_count.most_common(5):
            r, g, b = color
            brightness = (r + g + b) / 3
            saturation = max(r, g, b) - min(r, g, b)

            # Skip very dark or very light colors
            if brightness < 30 or brightness > 230:
                continue

            # Find the most saturated (colorful) option
            if saturation > max_saturation:
                max_saturation = saturation
                most_saturated = color

        # Use most saturated color, or fall back to most common
        if most_saturated:
            r_avg, g_avg, b_avg = most_saturated
        else:
            # Fallback - pick the color that's not too dark/light
            for color, count in pixel_count.most_common(5):
                r, g, b = color
                brightness = (r + g + b) / 3
                if 40 < brightness < 220:
                    r_avg, g_avg, b_avg = color
                    break
            else:
                r_avg, g_avg, b_avg = pixel_count.most_common(1)[0][0]

        # Lighten the color for background use
        # Mix with white (255, 255, 255)
        r_light = round(r_avg * (1 - lighten_percent) + 255 * lighten_percent)
        g_light = round(g_avg * (1 - lighten_percent) + 255 * lighten_percent)
        b_light = round(b_avg * (1 - lighten_percent) + 255 * lighten_percent)

        # Convert to hex
        hex_color = f"#{r_light:02x}{g_light:02x}{b_light:02x}"

        return hex_color

    except Exception as e:
        print(f"Failed to extract color from {image_url}: {e}")
        return None
