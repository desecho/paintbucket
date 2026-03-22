import { SPATIAL_CELL_SIZE } from '../utils/constants';

export class SpatialHash {
  private cellSize: number;
  private grid: Map<number, number[]>;

  constructor(cellSize = SPATIAL_CELL_SIZE) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private key(cx: number, cy: number): number {
    // Large prime hash to avoid collisions
    return cx * 92837111 + cy * 689287499;
  }

  clear(): void {
    this.grid.clear();
  }

  insert(index: number, x: number, y: number): void {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const k = this.key(cx, cy);
    const cell = this.grid.get(k);
    if (cell) {
      cell.push(index);
    } else {
      this.grid.set(k, [index]);
    }
  }

  query(x: number, y: number): number[] {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    const result: number[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = this.grid.get(this.key(cx + dx, cy + dy));
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            result.push(cell[i]);
          }
        }
      }
    }
    return result;
  }
}
