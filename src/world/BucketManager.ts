import { Bucket, createBucket } from './Bucket';

export class BucketManager {
  buckets: Bucket[] = [];

  add(x: number, y: number, width: number, height: number): Bucket {
    const minW = 40;
    const minH = 40;
    // Normalize negative dimensions
    let bx = width < 0 ? x + width : x;
    let by = height < 0 ? y + height : y;
    let bw = Math.abs(width);
    let bh = Math.abs(height);
    if (bw < minW) bw = minW;
    if (bh < minH) bh = minH;
    const bucket = createBucket(bx, by, bw, bh);
    this.buckets.push(bucket);
    return bucket;
  }

  clear(): void {
    this.buckets = [];
  }
}
