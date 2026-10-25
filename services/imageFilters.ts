/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  cssFilter: string;
  badge?: string;
}

export const PRESET_FILTERS: FilterPreset[] = [
  {
    id: 'grayscale',
    name: 'Monochrome B&W',
    description: 'Crisp black and white with balanced tones',
    cssFilter: 'grayscale(100%)',
    badge: 'Classic'
  },
  {
    id: 'sepia',
    name: 'Vintage Sepia',
    description: 'Warm antique photographic tone',
    cssFilter: 'sepia(100%)',
    badge: 'Retro'
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Deep punchy shadows and intense highlights',
    cssFilter: 'contrast(160%) brightness(105%)',
    badge: 'Dramatic'
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    description: 'Boosted saturation and vibrant colors',
    cssFilter: 'saturate(180%) contrast(115%)',
    badge: 'Color'
  },
  {
    id: 'warm-vintage',
    name: 'Golden Vintage',
    description: 'Warm sepia mid-tones with rich saturation',
    cssFilter: 'sepia(35%) saturate(135%) contrast(110%)',
    badge: 'Warm'
  },
  {
    id: 'cool-cyan',
    name: 'Cool Cyan',
    description: 'Moody cyan and teal hue shift',
    cssFilter: 'hue-rotate(170deg) saturate(125%) brightness(95%)',
    badge: 'Cool'
  },
  {
    id: 'matte-noir',
    name: 'Matte Noir',
    description: 'Faded film blacks with rich monochrome depth',
    cssFilter: 'grayscale(100%) contrast(135%) brightness(110%)',
    badge: 'Film'
  },
  {
    id: 'invert',
    name: 'Negative Invert',
    description: 'Invert colors for creative film-negative styling',
    cssFilter: 'invert(100%)',
    badge: 'Creative'
  },
  {
    id: 'soft-glow',
    name: 'Soft Dream Glow',
    description: 'Dreamy soft blur with illuminated brightness',
    cssFilter: 'blur(2px) brightness(115%) contrast(105%)',
    badge: 'Glow'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic magenta-cyan hue rotation and saturation',
    cssFilter: 'hue-rotate(280deg) saturate(220%) contrast(120%)',
    badge: 'Neon'
  }
];

export interface AdjustmentOptions {
  brightness?: number; // -100 to +100
  contrast?: number;   // -100 to +100
  saturation?: number; // -100 to +100
  blur?: number;       // 0 to 20
  hueRotate?: number;  // -180 to +180
}

/**
 * Transforms an image File by applying CSS filters or adjustment sliders onto an offscreen canvas.
 * Returns a new File object containing the processed image.
 */
export const transformImageFile = async (
  file: File,
  filterOrAdjustments: string | AdjustmentOptions
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(file);
          return;
        }

        if (typeof filterOrAdjustments === 'string') {
          ctx.filter = filterOrAdjustments;
        } else {
          const filterParts: string[] = [];
          const { brightness = 0, contrast = 0, saturation = 0, blur = 0, hueRotate = 0 } = filterOrAdjustments;

          if (brightness !== 0) {
            filterParts.push(`brightness(${Math.max(0, 100 + brightness)}%)`);
          }
          if (contrast !== 0) {
            filterParts.push(`contrast(${Math.max(0, 100 + contrast)}%)`);
          }
          if (saturation !== 0) {
            filterParts.push(`saturate(${Math.max(0, 100 + saturation)}%)`);
          }
          if (blur > 0) {
            filterParts.push(`blur(${blur}px)`);
          }
          if (hueRotate !== 0) {
            filterParts.push(`hue-rotate(${hueRotate}deg)`);
          }

          ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.[^/.]+$/, "") + `-${Date.now()}.png`;
            const newFile = new File([blob], fileName, { type: 'image/png' });
            resolve(newFile);
          } else {
            resolve(file);
          }
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image for filter processing: ${err}`));
    };

    img.src = url;
  });
};
