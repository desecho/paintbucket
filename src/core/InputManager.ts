import { World } from '../world/World';
import { Toolbar } from '../ui/Toolbar';
import { POUR_RATE, PARTICLE_RADIUS } from '../utils/constants';

export class InputManager {
  private mouseX = 0;
  private mouseY = 0;
  private mouseDown = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private pourAccumulator = 0;
  private lastPourX = 0;
  private lastPourY = 0;

  // Bucket preview state
  bucketPreview: { x: number; y: number; w: number; h: number } | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private world: World,
    private toolbar: Toolbar,
  ) {
    this.setupEvents();
  }

  private getCanvasPos(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private setupEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = this.getCanvasPos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
      this.mouseDown = true;
      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.lastPourX = pos.x;
      this.lastPourY = pos.y;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const pos = this.getCanvasPos(e);
      this.mouseX = pos.x;
      this.mouseY = pos.y;

      if (this.mouseDown && this.toolbar.activeTool === 'bucket') {
        this.bucketPreview = {
          x: this.dragStartX,
          y: this.dragStartY,
          w: this.mouseX - this.dragStartX,
          h: this.mouseY - this.dragStartY,
        };
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      if (this.mouseDown && this.toolbar.activeTool === 'bucket') {
        const w = this.mouseX - this.dragStartX;
        const h = this.mouseY - this.dragStartY;
        if (Math.abs(w) > 20 && Math.abs(h) > 20) {
          this.world.buckets.add(this.dragStartX, this.dragStartY, w, h);
        }
        this.bucketPreview = null;
      }
      this.stopInteraction();
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.stopInteraction();
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const pos = this.getCanvasPos(e.touches[0]);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
      this.mouseDown = true;
      this.dragStartX = pos.x;
      this.dragStartY = pos.y;
      this.lastPourX = pos.x;
      this.lastPourY = pos.y;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const pos = this.getCanvasPos(e.touches[0]);
      this.mouseX = pos.x;
      this.mouseY = pos.y;
      if (this.mouseDown && this.toolbar.activeTool === 'bucket') {
        this.bucketPreview = {
          x: this.dragStartX,
          y: this.dragStartY,
          w: this.mouseX - this.dragStartX,
          h: this.mouseY - this.dragStartY,
        };
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.toolbar.activeTool === 'bucket') {
        const w = this.mouseX - this.dragStartX;
        const h = this.mouseY - this.dragStartY;
        if (Math.abs(w) > 20 && Math.abs(h) > 20) {
          this.world.buckets.add(this.dragStartX, this.dragStartY, w, h);
        }
        this.bucketPreview = null;
      }
      this.stopInteraction();
    }, { passive: false });
  }

  update(dt: number): void {
    if (!this.mouseDown) {
      return;
    }

    if (this.toolbar.activeTool === 'pour') {
      this.pour(dt);
    }
  }

  private pour(dt: number): void {
    const color = this.toolbar.activeColor;
    const quality = this.world.getQualitySettings();
    this.pourAccumulator += POUR_RATE * quality.pourRateScale * dt;

    const startX = this.lastPourX;
    const startY = this.lastPourY;
    const endX = this.mouseX;
    const endY = this.mouseY;
    const moveX = endX - startX;
    const moveY = endY - startY;
    const streamVx = Math.max(-180, Math.min(180, moveX * 8));
    const streamVy = Math.max(-40, Math.min(120, moveY * 8));

    const particleBudget = quality.maxActiveParticles - this.world.particles.count;
    if (particleBudget <= 0) {
      this.pourAccumulator = Math.min(this.pourAccumulator, 1);
      this.lastPourX = endX;
      this.lastPourY = endY;
      return;
    }

    let spawned = 0;
    while (this.pourAccumulator >= 1 && spawned < particleBudget) {
      this.pourAccumulator -= 1;
      spawned++;

      const t = Math.random();
      const px = startX + moveX * t + (Math.random() - 0.5) * PARTICLE_RADIUS * 2.4;
      const py = startY + moveY * t + Math.random() * PARTICLE_RADIUS * 1.2;
      const pvx = streamVx + (Math.random() - 0.5) * 22;
      const pvy = 135 + streamVy + Math.random() * 36;
      this.world.particles.spawn(px, py, pvx, pvy, color);
    }

    this.lastPourX = endX;
    this.lastPourY = endY;
  }
  private stopInteraction(): void {
    this.mouseDown = false;
    this.bucketPreview = null;
    this.pourAccumulator = 0;
    this.lastPourX = this.mouseX;
    this.lastPourY = this.mouseY;
  }
}
