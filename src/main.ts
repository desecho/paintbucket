import { World } from './world/World';
import { Renderer } from './rendering/Renderer';
import { InputManager } from './core/InputManager';
import { GameLoop } from './core/GameLoop';
import { Toolbar } from './ui/Toolbar';

function init(): void {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  function resize(): void {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', () => {
    resize();
  });

  const world = new World();
  const toolbar = new Toolbar();
  const input = new InputManager(canvas, world, toolbar);
  const renderer = new Renderer(ctx, canvas);

  toolbar.onClear = () => world.clear();

  const loop = new GameLoop(
    (dt) => {
      input.update(dt);
      world.update(dt, window.innerWidth, window.innerHeight);
    },
    () => {
      // Reset transform before drawing (resize sets scale)
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      renderer.draw(world, input.bucketPreview);
    },
  );

  loop.start();
}

init();
