import { Bucket } from '../world/Bucket';

export class BucketRenderer {
  draw(ctx: CanvasRenderingContext2D, buckets: Bucket[]): void {
    ctx.save();

    for (const b of buckets) {
      // Glass-like container (open top)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 6;

      // Draw 3 sides: left, bottom, right (open top)
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + b.height);
      ctx.lineTo(b.x + b.width, b.y + b.height);
      ctx.lineTo(b.x + b.width, b.y);
      ctx.stroke();

      // Subtle fill for glass effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    ctx.restore();
  }

  drawPreview(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    const bx = w < 0 ? x + w : x;
    const by = h < 0 ? y + h : y;
    const bw = Math.abs(w);
    const bh = Math.abs(h);

    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    ctx.restore();
  }
}
