import { ParticleSystem } from '../simulation/ParticleSystem';
import { Physics } from '../simulation/Physics';
import { AdaptiveQualityController, type QualitySettings } from '../core/AdaptiveQuality';
import { BucketManager } from './BucketManager';

export class World {
  particles = new ParticleSystem();
  buckets = new BucketManager();
  physics = new Physics();
  private adaptiveQuality = new AdaptiveQualityController();

  update(dt: number, canvasW: number, canvasH: number): void {
    const quality = this.adaptiveQuality.update(this.particles.count);
    this.physics.update(this.particles, this.buckets.buckets, dt, canvasW, canvasH, quality.solverIterations);
  }

  clear(): void {
    this.particles.clear();
    this.buckets.clear();
  }

  getQualitySettings(): QualitySettings {
    return this.adaptiveQuality.current;
  }
}
