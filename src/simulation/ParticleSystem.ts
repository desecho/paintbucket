import { RGBA } from '../utils/Color';
import { MAX_PARTICLES, PARTICLE_RADIUS } from '../utils/constants';

/**
 * Struct-of-arrays particle storage for cache-friendly iteration.
 */
export class ParticleSystem {
  readonly capacity: number;
  count = 0;

  // Position
  x: Float32Array;
  y: Float32Array;
  // Velocity
  vx: Float32Array;
  vy: Float32Array;
  // Color channels are stored as floats so diffusion stays smooth.
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  a: Float32Array;
  // Per-particle radius
  radius: Float32Array;
  // Bucket containment (-1 = free)
  bucketId: Int32Array;
  // Sleep tracking
  sleepCounter: Uint16Array;
  sleeping: Uint8Array; // boolean as 0/1

  constructor(capacity = MAX_PARTICLES) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.r = new Float32Array(capacity);
    this.g = new Float32Array(capacity);
    this.b = new Float32Array(capacity);
    this.a = new Float32Array(capacity);
    this.radius = new Float32Array(capacity);
    this.bucketId = new Int32Array(capacity);
    this.sleepCounter = new Uint16Array(capacity);
    this.sleeping = new Uint8Array(capacity);
  }

  spawn(px: number, py: number, pvx: number, pvy: number, color: RGBA): number {
    if (this.count >= this.capacity) {
      // Overwrite oldest particle
      this.removeAt(0);
    }
    const i = this.count++;
    this.x[i] = px;
    this.y[i] = py;
    this.vx[i] = pvx;
    this.vy[i] = pvy;
    this.r[i] = color.r;
    this.g[i] = color.g;
    this.b[i] = color.b;
    this.a[i] = color.a;
    this.radius[i] = PARTICLE_RADIUS;
    this.bucketId[i] = -1;
    this.sleepCounter[i] = 0;
    this.sleeping[i] = 0;
    return i;
  }

  removeAt(index: number): void {
    const last = this.count - 1;
    if (index < last) {
      // Swap with last
      this.x[index] = this.x[last];
      this.y[index] = this.y[last];
      this.vx[index] = this.vx[last];
      this.vy[index] = this.vy[last];
      this.r[index] = this.r[last];
      this.g[index] = this.g[last];
      this.b[index] = this.b[last];
      this.a[index] = this.a[last];
      this.radius[index] = this.radius[last];
      this.bucketId[index] = this.bucketId[last];
      this.sleepCounter[index] = this.sleepCounter[last];
      this.sleeping[index] = this.sleeping[last];
    }
    this.count--;
  }

  trimTo(maxCount: number): void {
    if (this.count <= maxCount) return;

    let remainingToTrim = this.count - maxCount;

    // Prefer removing sleeping particles first because they contribute the least
    // to perceived motion but still cost physics and rendering work.
    for (let i = this.count - 1; i >= 0 && remainingToTrim > 0; i--) {
      if (!this.sleeping[i]) continue;
      this.removeAt(i);
      remainingToTrim--;
      if (i > this.count) {
        i = this.count;
      }
    }

    while (this.count > maxCount) {
      this.removeAt(this.count - 1);
    }
  }

  clear(): void {
    this.count = 0;
  }
}
