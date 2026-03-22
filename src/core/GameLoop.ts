import type { QualitySettings } from './AdaptiveQuality';

type StepConfig = Pick<QualitySettings, 'fixedTimestep' | 'maxSubsteps'>;

export class GameLoop {
  private lastTime = 0;
  private running = false;
  private accumulator = 0;
  private onUpdate: (dt: number) => void;
  private onDraw: () => void;
  private getStepConfig: () => StepConfig;

  constructor(onUpdate: (dt: number) => void, onDraw: () => void, getStepConfig: () => StepConfig) {
    this.onUpdate = onUpdate;
    this.onDraw = onDraw;
    this.getStepConfig = getStepConfig;
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
    const { fixedTimestep, maxSubsteps } = this.getStepConfig();

    if (dt > fixedTimestep * maxSubsteps) {
      dt = fixedTimestep * maxSubsteps;
    }

    this.accumulator += dt;

    let steps = 0;
    while (this.accumulator >= fixedTimestep && steps < maxSubsteps) {
      this.onUpdate(fixedTimestep);
      this.accumulator -= fixedTimestep;
      steps++;
    }

    if (steps === maxSubsteps && this.accumulator >= fixedTimestep) {
      this.accumulator = 0;
    }

    this.onDraw();

    requestAnimationFrame((t) => this.tick(t));
  }
}
