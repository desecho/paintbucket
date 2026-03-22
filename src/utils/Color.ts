export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function rgba(r: number, g: number, b: number, a = 255): RGBA {
  return { r, g, b, a };
}

export function toCSS(c: RGBA): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a / 255})`;
}

export function hexToRGBA(hex: string): RGBA {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
    a: 255,
  };
}

/**
 * Subtractive color mixing using weighted geometric mean.
 * This approximates paint-like mixing: red+blue=purple, red+yellow=orange, etc.
 */
export function mixSubtractive(c1: RGBA, c2: RGBA, ratio: number): RGBA {
  const invRatio = 1 - ratio;

  // Convert to 0-1, add small epsilon to avoid log(0)
  const eps = 0.001;
  const r1 = (c1.r / 255) + eps;
  const g1 = (c1.g / 255) + eps;
  const b1 = (c1.b / 255) + eps;
  const r2 = (c2.r / 255) + eps;
  const g2 = (c2.g / 255) + eps;
  const b2 = (c2.b / 255) + eps;

  // Weighted geometric mean (subtractive approximation)
  const r = Math.pow(r1, invRatio) * Math.pow(r2, ratio);
  const g = Math.pow(g1, invRatio) * Math.pow(g2, ratio);
  const b = Math.pow(b1, invRatio) * Math.pow(b2, ratio);

  return {
    r: Math.round(Math.min(255, Math.max(0, (r - eps) * 255))),
    g: Math.round(Math.min(255, Math.max(0, (g - eps) * 255))),
    b: Math.round(Math.min(255, Math.max(0, (b - eps) * 255))),
    a: Math.round(c1.a * invRatio + c2.a * ratio),
  };
}
