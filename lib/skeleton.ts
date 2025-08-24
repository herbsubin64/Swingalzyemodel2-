export type Keypoint = { x: number; y: number; name: string };
export type Pose = { keypoints: Keypoint[] };

/**
 * Placeholder: future hook to map model keypoints into canvas coords.
 * Kept so you can later plug in a real pose-estimation backend easily.
 */
export function scalePoseToCanvas(pose: Pose, width: number, height: number): Pose {
  const xs = pose.keypoints.map(k => k.x);
  const ys = pose.keypoints.map(k => k.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  return {
    keypoints: pose.keypoints.map(k => ({
      name: k.name,
      x: ((k.x - minX) / w) * width,
      y: ((k.y - minY) / h) * height
    }))
  };
}
