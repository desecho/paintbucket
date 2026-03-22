import { ParticleSystem } from './ParticleSystem';
import { SpatialHash } from './SpatialHash';
import { ColorMixer } from './ColorMixer';
import { Bucket } from '../world/Bucket';
import {
  GRAVITY,
  REST_DISTANCE,
  INTERACTION_RADIUS,
  PRESSURE_STIFFNESS,
  NEAR_PRESSURE_STIFFNESS,
  COHESION_STRENGTH,
  VISCOSITY,
  VELOCITY_DAMPING,
  MAX_SPEED,
  SLEEP_THRESHOLD,
  SLEEP_FRAMES,
  COLOR_DIFFUSION_RATE,
} from '../utils/constants';

export class Physics {
  private spatialHash = new SpatialHash();
  private colorMixer = new ColorMixer();
  private prevX = new Float32Array(0);
  private prevY = new Float32Array(0);
  private neighborScratch: number[] = [];

  update(
    ps: ParticleSystem,
    buckets: Bucket[],
    dt: number,
    canvasW: number,
    canvasH: number,
    solverIterations: number,
  ): void {
    const n = ps.count;
    if (n === 0) return;

    this.ensureScratch(ps.capacity);
    for (let i = 0; i < n; i++) {
      this.prevX[i] = ps.x[i];
      this.prevY[i] = ps.y[i];
      ps.bucketId[i] = -1;
    }

    this.buildSpatialHash(ps, n);
    this.applyViscosity(ps, dt, n);

    const drag = Math.pow(VELOCITY_DAMPING, dt * 60);
    for (let i = 0; i < n; i++) {
      if (ps.sleeping[i]) continue;
      ps.vy[i] += GRAVITY * dt;
      ps.vx[i] *= drag;
      ps.vy[i] *= drag;
      this.clampSpeed(ps, i);

      ps.x[i] += ps.vx[i] * dt;
      ps.y[i] += ps.vy[i] * dt;
    }

    const iterations = Math.max(1, solverIterations);
    for (let iteration = 0; iteration < iterations; iteration++) {
      this.buildSpatialHash(ps, n);
      this.relaxParticles(ps, iteration === 0);

      for (let i = 0; i < n; i++) {
        this.constrainToCanvas(ps, i, canvasW, canvasH);
        for (const bucket of buckets) {
          this.collideBucket(ps, i, bucket);
        }
      }
    }

    for (let i = 0; i < n; i++) {
      const dx = ps.x[i] - this.prevX[i];
      const dy = ps.y[i] - this.prevY[i];
      ps.vx[i] = dx / dt;
      ps.vy[i] = dy / dt;

      const speedSq = ps.vx[i] * ps.vx[i] + ps.vy[i] * ps.vy[i];
      if (speedSq < SLEEP_THRESHOLD * SLEEP_THRESHOLD) {
        ps.sleepCounter[i]++;
        if (ps.sleepCounter[i] > SLEEP_FRAMES) {
          ps.sleeping[i] = 1;
          ps.vx[i] = 0;
          ps.vy[i] = 0;
        }
      } else {
        ps.sleeping[i] = 0;
        ps.sleepCounter[i] = 0;
      }
    }
  }

  private ensureScratch(capacity: number): void {
    if (this.prevX.length === capacity) return;
    this.prevX = new Float32Array(capacity);
    this.prevY = new Float32Array(capacity);
  }

  private buildSpatialHash(ps: ParticleSystem, count: number): void {
    this.spatialHash.clear();
    for (let i = 0; i < count; i++) {
      this.spatialHash.insert(i, ps.x[i], ps.y[i]);
    }
  }

  private applyViscosity(ps: ParticleSystem, dt: number, count: number): void {
    const maxDistSq = INTERACTION_RADIUS * INTERACTION_RADIUS;

    for (let i = 0; i < count; i++) {
      const neighbors = this.spatialHash.queryInto(ps.x[i], ps.y[i], this.neighborScratch);
      for (let ni = 0; ni < neighbors.length; ni++) {
        const j = neighbors[ni];
        if (j <= i) continue;

        const dx = ps.x[j] - ps.x[i];
        const dy = ps.y[j] - ps.y[i];
        const dSq = dx * dx + dy * dy;
        if (dSq <= 0.0001 || dSq >= maxDistSq) continue;

        const d = Math.sqrt(dSq);
        const nx = dx / d;
        const ny = dy / d;
        const rel = (ps.vx[i] - ps.vx[j]) * nx + (ps.vy[i] - ps.vy[j]) * ny;
        if (rel <= 0) continue;

        const q = 1 - d / INTERACTION_RADIUS;
        const impulse = rel * VISCOSITY * q * dt;
        const activeI = ps.sleeping[i] ? 0 : 1;
        const activeJ = ps.sleeping[j] ? 0 : 1;
        const weight = activeI + activeJ;
        if (weight === 0) continue;

        const impulseX = nx * impulse;
        const impulseY = ny * impulse;

        if (activeI) {
          ps.vx[i] -= impulseX * (activeI / weight);
          ps.vy[i] -= impulseY * (activeI / weight);
        }
        if (activeJ) {
          ps.vx[j] += impulseX * (activeJ / weight);
          ps.vy[j] += impulseY * (activeJ / weight);
        }
      }
    }
  }

  private relaxParticles(ps: ParticleSystem, shouldDiffuseColors: boolean): void {
    const restSq = REST_DISTANCE * REST_DISTANCE;
    const maxDistSq = INTERACTION_RADIUS * INTERACTION_RADIUS;

    for (let i = 0; i < ps.count; i++) {
      const neighbors = this.spatialHash.queryInto(ps.x[i], ps.y[i], this.neighborScratch);
      for (let ni = 0; ni < neighbors.length; ni++) {
        const j = neighbors[ni];
        if (j <= i) continue;

        const dx = ps.x[j] - ps.x[i];
        const dy = ps.y[j] - ps.y[i];
        const dSq = dx * dx + dy * dy;
        if (dSq <= 0.0001 || dSq >= maxDistSq) continue;

        const d = Math.sqrt(dSq);
        const nx = dx / d;
        const ny = dy / d;
        const activeI = ps.sleeping[i] ? 0 : 1;
        const activeJ = ps.sleeping[j] ? 0 : 1;
        const totalWeight = activeI + activeJ;
        if (totalWeight === 0) continue;

        let displacement = 0;
        if (dSq < restSq) {
          const q = 1 - d / REST_DISTANCE;
          displacement = q * (PRESSURE_STIFFNESS + NEAR_PRESSURE_STIFFNESS * q);
        } else {
          const q = 1 - d / INTERACTION_RADIUS;
          displacement = -COHESION_STRENGTH * q * q;
        }

        if (displacement === 0) continue;

        const moveI = activeI / totalWeight;
        const moveJ = activeJ / totalWeight;

        if (activeI) {
          ps.x[i] -= nx * displacement * moveI;
          ps.y[i] -= ny * displacement * moveI;
        }
        if (activeJ) {
          ps.x[j] += nx * displacement * moveJ;
          ps.y[j] += ny * displacement * moveJ;
        }

        if (Math.abs(displacement) > 0.003) {
          this.wakeParticle(ps, i);
          this.wakeParticle(ps, j);
        }

        if (shouldDiffuseColors) {
          this.colorMixer.diffuse(ps, i, j, COLOR_DIFFUSION_RATE, 1 - d / INTERACTION_RADIUS);
        }
      }
    }
  }

  private clampSpeed(ps: ParticleSystem, i: number): void {
    const speedSq = ps.vx[i] * ps.vx[i] + ps.vy[i] * ps.vy[i];
    if (speedSq <= MAX_SPEED * MAX_SPEED) return;

    const speed = Math.sqrt(speedSq);
    const scale = MAX_SPEED / speed;
    ps.vx[i] *= scale;
    ps.vy[i] *= scale;
  }

  private constrainToCanvas(ps: ParticleSystem, i: number, canvasW: number, canvasH: number): void {
    const r = ps.radius[i];
    if (ps.x[i] < r) ps.x[i] = r;
    if (ps.x[i] > canvasW - r) ps.x[i] = canvasW - r;
    if (ps.y[i] < r) ps.y[i] = r;
    if (ps.y[i] > canvasH - r) ps.y[i] = canvasH - r;
  }

  private wakeParticle(ps: ParticleSystem, index: number): void {
    ps.sleeping[index] = 0;
    ps.sleepCounter[index] = 0;
  }

  private collideBucket(ps: ParticleSystem, i: number, bucket: Bucket): void {
    const px = ps.x[i];
    const py = ps.y[i];
    const r = ps.radius[i];
    const b = bucket;

    const margin = r + 6;

    if (px < b.x - margin || px > b.x + b.width + margin ||
        py < b.y - margin || py > b.y + b.height + margin) {
      return;
    }

    const left = b.x + r;
    const right = b.x + b.width - r;
    const bottom = b.y + b.height - r;
    const belowLip = py > b.y + r * 0.35;
    const insideX = px > left && px < right;
    const insideY = py > b.y + r && py < bottom;
    const insideVerticalSpan = py > b.y - r && py < b.y + b.height + r;

    if (insideX && py > b.y) {
      ps.bucketId[i] = bucket.id;
    }

    if (insideX && py > bottom) {
      ps.y[i] = bottom;
    }

    if (insideVerticalSpan && belowLip) {
      if (px < left && px > b.x - margin) {
        ps.x[i] = left;
        ps.bucketId[i] = bucket.id;
      } else if (px > right && px < b.x + b.width + margin) {
        ps.x[i] = right;
        ps.bucketId[i] = bucket.id;
      }
    }

    if (insideX && insideY) {
      ps.bucketId[i] = bucket.id;
    }
  }
}
