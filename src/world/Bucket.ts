export interface Bucket {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

let nextBucketId = 0;

export function createBucket(x: number, y: number, width: number, height: number): Bucket {
  return { id: nextBucketId++, x, y, width, height };
}
