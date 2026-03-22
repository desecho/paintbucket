# Paintbucket

Paintbucket is a small browser-based fluid toy built with TypeScript, Vite, and the HTML canvas. You can pour colored particles, place buckets to catch them, and watch colors diffuse together over time.

## Features

- Real-time particle-based fluid simulation
- Dye-style color diffusion between nearby particles
- Bucket placement tool for simple containment
- Adaptive quality settings that reduce simulation and render cost as particle counts rise
- Mouse and touch input support

## Getting Started

### Requirements

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite will start a local dev server. Open the URL it prints in your terminal.

### Build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Controls

- `Pour`: click and drag on the canvas to pour the selected color
- `Bucket`: click and drag to draw a rectangular container
- `Colors`: choose from the palette or use the custom color picker
- `Clear All`: remove all particles and buckets

## Project Structure

```text
src/
  core/        input handling, game loop, adaptive quality
  rendering/   canvas rendering for particles, buckets, and scene
  simulation/  physics, particle storage, spatial hashing, color mixing
  ui/          toolbar setup and interactions
  utils/       math, color helpers, shared constants
  world/       world state and bucket management
```

## Notes

- The app scales the canvas to the current window size and device pixel ratio.
- Performance is managed dynamically through `AdaptiveQualityController`.
- The entrypoint is [`src/main.ts`](./src/main.ts).
