/**
 * Camera Model for Canvas Navigation
 * 
 * The camera defines what part of the world is visible in the viewport.
 * - x, y: world coordinates of the center point (px)
 * - zoom: scale factor (0.2 = 20%, 1.0 = 100%, 2.0 = 200%)
 */

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export const CAMERA_CONFIG = {
  MIN_ZOOM: 0.2,
  MAX_ZOOM: 2.0,
  DEFAULT_ZOOM: 1.0,
  WORLD_PADDING: 400, // px padding around frames for camera bounds
} as const;

export function clampZoom(zoom: number): number {
  return Math.max(CAMERA_CONFIG.MIN_ZOOM, Math.min(CAMERA_CONFIG.MAX_ZOOM, zoom));
}

export function clampCamera(camera: Camera, frame: { layout: { x: number; y: number; w: number; h: number } }): Camera {
  const padding = CAMERA_CONFIG.WORLD_PADDING;
  const bounds = {
    minX: frame.layout.x - padding,
    maxX: frame.layout.x + frame.layout.w + padding,
    minY: frame.layout.y - padding,
    maxY: frame.layout.y + frame.layout.h + padding,
  };
  
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, camera.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, camera.y)),
    zoom: clampZoom(camera.zoom),
  };
}

/**
 * Fit camera to show entire frame with padding
 */
export function fitCameraToFrame(
  frameX: number,
  frameY: number,
  frameW: number,
  frameH: number,
  viewport: { width: number; height: number },
  padding: number = 120
): Camera {
  const scaleX = (viewport.width - padding * 2) / frameW;
  const scaleY = (viewport.height - padding * 2) / frameH;
  const zoom = clampZoom(Math.min(scaleX, scaleY));

  return {
    x: frameX + frameW / 2,
    y: frameY + frameH / 2,
    zoom,
  };
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera,
  viewport: { width: number; height: number }
): { x: number; y: number } {
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  const worldX = camera.x + (screenX - centerX) / camera.zoom;
  const worldY = camera.y + (screenY - centerY) / camera.zoom;

  return { x: worldX, y: worldY };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera,
  viewport: { width: number; height: number }
): { x: number; y: number } {
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  const screenX = centerX + (worldX - camera.x) * camera.zoom;
  const screenY = centerY + (worldY - camera.y) * camera.zoom;

  return { x: screenX, y: screenY };
}
