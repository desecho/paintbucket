import { World } from '../world/World';
import { ParticleRenderer } from './ParticleRenderer';
import { BucketRenderer } from './BucketRenderer';

export class Renderer {
  private particleRenderer = new ParticleRenderer();
  private bucketRenderer = new BucketRenderer();

  constructor(
    private ctx: CanvasRenderingContext2D,
    _canvas: HTMLCanvasElement,
  ) {}

  draw(world: World, bucketPreview: { x: number; y: number; w: number; h: number } | null): void {
    const { ctx } = this;
    const logicalW = window.innerWidth;
    const logicalH = window.innerHeight;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, logicalW, logicalH);

    // Draw a subtle grid for the sandbox feel
    this.drawGrid(logicalW, logicalH);

    // Particles (fluid) — rendered through goo filter for liquid look
    this.particleRenderer.draw(ctx, world.particles, logicalW, logicalH);

    // Buckets drawn on top of fluid so outlines stay visible
    this.bucketRenderer.draw(ctx, world.buckets.buckets);

    // Bucket placement preview
    if (bucketPreview) {
      this.bucketRenderer.drawPreview(ctx, bucketPreview.x, bucketPreview.y, bucketPreview.w, bucketPreview.h);
    }
  }

  private drawGrid(w: number, h: number): void {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
