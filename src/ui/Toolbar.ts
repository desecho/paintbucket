import { RGBA, hexToRGBA } from '../utils/Color';
import { PALETTE_COLORS } from '../utils/constants';

export type ToolType = 'pour' | 'bucket';

export class Toolbar {
  activeTool: ToolType = 'pour';
  activeColor: RGBA = hexToRGBA(PALETTE_COLORS[0]);
  onClear: (() => void) | null = null;

  constructor() {
    this.setupColors();
    this.setupTools();
    this.setupClear();
  }

  private setupColors(): void {
    const palette = document.getElementById('color-palette')!;
    PALETTE_COLORS.forEach((hex, idx) => {
      const swatch = document.createElement('button');
      swatch.className = 'color-swatch' + (idx === 0 ? ' active' : '');
      swatch.style.background = hex;
      swatch.dataset.color = hex;
      swatch.addEventListener('click', () => {
        palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        this.activeColor = hexToRGBA(hex);
      });
      palette.appendChild(swatch);
    });

    const customInput = document.getElementById('custom-color') as HTMLInputElement;
    customInput.addEventListener('input', () => {
      const palette = document.getElementById('color-palette')!;
      palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      this.activeColor = hexToRGBA(customInput.value);
    });
  }

  private setupTools(): void {
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTool = (btn as HTMLElement).dataset.tool as ToolType;
      });
    });
  }

  private setupClear(): void {
    document.getElementById('clear-btn')!.addEventListener('click', () => {
      this.onClear?.();
    });
  }
}
