import { FIXED_TIMESTEP, MAX_SUBSTEPS, SOLVER_ITERATIONS } from '../utils/constants';

export interface QualitySettings {
  fixedTimestep: number;
  maxSubsteps: number;
  solverIterations: number;
  renderScale: number;
  drawGrid: boolean;
  bucketShadows: boolean;
}

interface QualityLevel extends QualitySettings {
  maxParticles: number;
}

const QUALITY_LEVELS: QualityLevel[] = [
  {
    maxParticles: 1400,
    fixedTimestep: FIXED_TIMESTEP,
    maxSubsteps: MAX_SUBSTEPS,
    solverIterations: SOLVER_ITERATIONS,
    renderScale: 0.9,
    drawGrid: true,
    bucketShadows: true,
  },
  {
    maxParticles: 2600,
    fixedTimestep: 1 / 90,
    maxSubsteps: 6,
    solverIterations: 3,
    renderScale: 0.82,
    drawGrid: true,
    bucketShadows: true,
  },
  {
    maxParticles: 4200,
    fixedTimestep: 1 / 75,
    maxSubsteps: 5,
    solverIterations: 3,
    renderScale: 0.72,
    drawGrid: false,
    bucketShadows: true,
  },
  {
    maxParticles: 5600,
    fixedTimestep: 1 / 60,
    maxSubsteps: 4,
    solverIterations: 2,
    renderScale: 0.62,
    drawGrid: false,
    bucketShadows: false,
  },
  {
    maxParticles: Infinity,
    fixedTimestep: 1 / 50,
    maxSubsteps: 3,
    solverIterations: 2,
    renderScale: 0.52,
    drawGrid: false,
    bucketShadows: false,
  },
];

const UPSHIFT_HYSTERESIS = 0.8;

export class AdaptiveQualityController {
  private levelIndex = 0;
  current: QualitySettings = QUALITY_LEVELS[0];

  update(particleCount: number): QualitySettings {
    while (
      this.levelIndex < QUALITY_LEVELS.length - 1 &&
      particleCount > QUALITY_LEVELS[this.levelIndex].maxParticles
    ) {
      this.levelIndex++;
    }

    while (
      this.levelIndex > 0 &&
      particleCount < QUALITY_LEVELS[this.levelIndex - 1].maxParticles * UPSHIFT_HYSTERESIS
    ) {
      this.levelIndex--;
    }

    this.current = QUALITY_LEVELS[this.levelIndex];
    return this.current;
  }
}
