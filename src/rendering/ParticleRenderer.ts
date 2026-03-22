import { ParticleSystem } from '../simulation/ParticleSystem';

export class ParticleRenderer {
  private offscreen: OffscreenCanvas | null = null;
  private offCtx: OffscreenCanvasRenderingContext2D | null = null;
  private lastW = 0;
  private lastH = 0;

  private ensureOffscreen(w: number, h: number): void {
    if (this.lastW !== w || this.lastH !== h) {
      this.offscreen = new OffscreenCanvas(w, h);
      this.offCtx = this.offscreen.getContext('2d')!;
      this.lastW = w;
      this.lastH = h;
    }
  }

  draw(ctx: CanvasRenderingContext2D, ps: ParticleSystem, logicalW: number, logicalH: number): void {
    const n = ps.count;
    if (n === 0) return;

    const scale = 0.9;
    const ow = Math.ceil(logicalW * scale);
    const oh = Math.ceil(logicalH * scale);
    this.ensureOffscreen(ow, oh);

    const oc = this.offCtx!;
    oc.clearRect(0, 0, ow, oh);

    const blobScale = 3.35;
    for (let i = 0; i < n; i++) {
      const x = ps.x[i] * scale;
      const y = ps.y[i] * scale;
      const r = ps.radius[i] * scale * blobScale;
      const cr = Math.round(ps.r[i]);
      const cg = Math.round(ps.g[i]);
      const cb = Math.round(ps.b[i]);

      const grad = oc.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.68)`);
      grad.addColorStop(0.38, `rgba(${cr},${cg},${cb},0.52)`);
      grad.addColorStop(0.72, `rgba(${cr},${cg},${cb},0.18)`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);

      oc.beginPath();
      oc.arc(x, y, r, 0, Math.PI * 2);
      oc.fillStyle = grad;
      oc.fill();
    }

    ctx.save();
    ctx.filter = 'url(#goo)';
    ctx.drawImage(this.offscreen!, 0, 0, ow, oh, 0, 0, logicalW, logicalH);
    ctx.filter = 'none';
    ctx.restore();
  }
}
