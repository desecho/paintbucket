export const FIXED_TIMESTEP = 1 / 120;
export const MAX_SUBSTEPS = 8;

export const GRAVITY = 1400;
export const PARTICLE_RADIUS = 3;
export const PARTICLE_DIAMETER = PARTICLE_RADIUS * 2;
export const REST_DISTANCE = PARTICLE_DIAMETER * 0.92;
export const INTERACTION_RADIUS = PARTICLE_DIAMETER * 2.35;
export const PRESSURE_STIFFNESS = 0.35;
export const NEAR_PRESSURE_STIFFNESS = 0.72;
export const COHESION_STRENGTH = 0.02;
export const VISCOSITY = 0.18;
export const VELOCITY_DAMPING = 0.996;
export const MAX_SPEED = 1800;
export const SOLVER_ITERATIONS = 4;
export const MAX_PARTICLES = 8000;
export const COLOR_DIFFUSION_RATE = 0.08;
export const POUR_RATE = 780; // particles per second when pouring
export const SPATIAL_CELL_SIZE = INTERACTION_RADIUS;
export const SLEEP_THRESHOLD = 10;
export const SLEEP_FRAMES = 90;

export const PALETTE_COLORS = [
  '#ff6b6b',
  '#ff9f43',
  '#ffd166',
  '#7bd389',
  '#2ec4b6',
  '#48bfe3',
  '#4361ee',
  '#9b5de5',
  '#ffffff',
];
