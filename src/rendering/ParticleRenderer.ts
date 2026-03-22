import { ParticleSystem } from '../simulation/ParticleSystem';

export class ParticleRenderer {
  private offscreen: OffscreenCanvas | null = null;
  private offCtx: OffscreenCanvasRenderingContext2D | null = null;
  private lastW = 0;
  private lastH = 0;
  private blobSprite: OffscreenCanvas | null = null;
  private tintedSprites = new Map<string, OffscreenCanvas>();
  private tintedSpriteOrder: string[] = [];

  private readonly blobSpriteSize = 96;
  private readonly colorQuantization = 16;
  private readonly maxTintedSprites = 192;

  private ensureOffscreen(w: number, h: number): void {
    if (this.lastW !== w || this.lastH !== h) {
      this.offscreen = new OffscreenCanvas(w, h);
      this.offCtx = this.offscreen.getContext('2d')!;
      this.lastW = w;
      this.lastH = h;
    }
  }

  private ensureBlobSprite(): void {
    if (this.blobSprite) return;

    const size = this.blobSpriteSize;
    const radius = size * 0.5;
    const sprite = new OffscreenCanvas(size, size);
    const ctx = sprite.getContext('2d')!;

    const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.68)');
    grad.addColorStop(0.38, 'rgba(255,255,255,0.52)');
    grad.addColorStop(0.72, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    this.blobSprite = sprite;
  }

  private quantizeColorChannel(value: number): number {
    const quantized = Math.round(value / this.colorQuantization) * this.colorQuantization;
    return Math.max(0, Math.min(255, quantized));
  }

  private getTintedSprite(r: number, g: number, b: number): OffscreenCanvas {
    this.ensureBlobSprite();

    const qr = this.quantizeColorChannel(r);
    const qg = this.quantizeColorChannel(g);
    const qb = this.quantizeColorChannel(b);
    const key = `${qr},${qg},${qb}`;
    const cached = this.tintedSprites.get(key);
    if (cached) return cached;

    const sprite = new OffscreenCanvas(this.blobSpriteSize, this.blobSpriteSize);
    const ctx = sprite.getContext('2d')!;
    ctx.drawImage(this.blobSprite!, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = `rgb(${qr}, ${qg}, ${qb})`;
    ctx.fillRect(0, 0, this.blobSpriteSize, this.blobSpriteSize);
    ctx.globalCompositeOperation = 'source-over';

    this.tintedSprites.set(key, sprite);
    this.tintedSpriteOrder.push(key);

    if (this.tintedSpriteOrder.length > this.maxTintedSprites) {
      const oldestKey = this.tintedSpriteOrder.shift()!;
      this.tintedSprites.delete(oldestKey);
    }

    return sprite;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    ps: ParticleSystem,
    logicalW: number,
    logicalH: number,
    renderScale: number,
    renderStride: number,
  ): void {
    const n = ps.count;
    if (n === 0) return;

    const scale = renderScale;
    const ow = Math.ceil(logicalW * scale);
    const oh = Math.ceil(logicalH * scale);
    this.ensureOffscreen(ow, oh);

    const oc = this.offCtx!;
    oc.clearRect(0, 0, ow, oh);

    const blobScale = 3.35;
    this.ensureBlobSprite();
    const stride = Math.max(1, renderStride);
    const radiusBoost = stride === 1 ? 1 : 1 + (stride - 1) * 0.14;
    for (let i = 0; i < n; i += stride) {
      const x = ps.x[i] * scale;
      const y = ps.y[i] * scale;
      const blobRadius = ps.radius[i] * scale * blobScale * radiusBoost;
      const sprite = this.getTintedSprite(ps.r[i], ps.g[i], ps.b[i]);
      const diameter = blobRadius * 2;
      oc.drawImage(sprite, x - blobRadius, y - blobRadius, diameter, diameter);
    }

    ctx.save();
    ctx.filter = 'url(#goo)';
    ctx.drawImage(this.offscreen!, 0, 0, ow, oh, 0, 0, logicalW, logicalH);
    ctx.filter = 'none';
    ctx.restore();
  }
}
