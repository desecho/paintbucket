import { FIXED_TIMESTEP, MAX_SUBSTEPS } from '../utils/constants';

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private accumulator = 0;
  private onUpdate: (dt: number) => void;
  private onDraw: () => void;

  constructor(onUpdate: (dt: number) => void, onDraw: () => void) {
    this.onUpdate = onUpdate;
    this.onDraw = onDraw;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    requestAnimationFrame((t) => this.tick(t));
  }

  stop(): void {
    this.running = false;
  }

  private tick(timestamp: number): void {
    if (!this.running) return;

    let dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    if (dt > FIXED_TIMESTEP * MAX_SUBSTEPS) {
      dt = FIXED_TIMESTEP * MAX_SUBSTEPS;
    }

    this.accumulator += dt;

    let steps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && steps < MAX_SUBSTEPS) {
      this.onUpdate(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
      steps++;
    }

    if (steps === MAX_SUBSTEPS && this.accumulator >= FIXED_TIMESTEP) {
      this.accumulator = 0;
    }

    this.onDraw();

    requestAnimationFrame((t) => this.tick(t));
  }
}
