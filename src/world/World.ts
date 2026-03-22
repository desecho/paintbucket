import { ParticleSystem } from '../simulation/ParticleSystem';
import { Physics } from '../simulation/Physics';
import { BucketManager } from './BucketManager';

export class World {
  particles = new ParticleSystem();
  buckets = new BucketManager();
  physics = new Physics();

  update(dt: number, canvasW: number, canvasH: number): void {
    this.physics.update(this.particles, this.buckets.buckets, dt, canvasW, canvasH);
  }

  clear(): void {
    this.particles.clear();
    this.buckets.clear();
  }
}
