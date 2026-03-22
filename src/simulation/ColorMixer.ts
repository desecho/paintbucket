import { ParticleSystem } from './ParticleSystem';

/**
 * Handles dye-like diffusion between neighboring particles.
 * Water should drift toward a shared tint instead of collapsing toward mud.
 */
export class ColorMixer {
  diffuse(ps: ParticleSystem, i: number, j: number, rate: number, proximity = 1): void {
    const blend = Math.min(0.45, rate * proximity);
    if (blend <= 0) return;

    const r1 = ps.r[i];
    const g1 = ps.g[i];
    const b1 = ps.b[i];
    const r2 = ps.r[j];
    const g2 = ps.g[j];
    const b2 = ps.b[j];

    const mr = (r1 + r2) * 0.5;
    const mg = (g1 + g2) * 0.5;
    const mb = (b1 + b2) * 0.5;

    ps.r[i] = r1 + (mr - r1) * blend;
    ps.g[i] = g1 + (mg - g1) * blend;
    ps.b[i] = b1 + (mb - b1) * blend;

    ps.r[j] = r2 + (mr - r2) * blend;
    ps.g[j] = g2 + (mg - g2) * blend;
    ps.b[j] = b2 + (mb - b2) * blend;
  }
}
