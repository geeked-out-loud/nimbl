import { GridPosition, FormComponent } from './types';

const GRID_SIZE = 8; // pixels
const COLUMNS = 20;

/**
 * Snap a pixel value to the nearest grid position
 */
export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Convert pixel position to grid coordinates
 */
export function pixelToGrid(x: number, y: number, canvasWidth: number): { col: number; row: number } {
  const columnWidth = canvasWidth / COLUMNS;
  const col = Math.floor(x / columnWidth);
  const row = Math.floor(y / GRID_SIZE);
  
  return {
    col: Math.max(0, Math.min(COLUMNS - 1, col)),
    row: Math.max(0, row),
  };
}

/**
 * Convert grid coordinates to pixel position
 */
export function gridToPixel(col: number, row: number, canvasWidth: number): { x: number; y: number } {
  const columnWidth = canvasWidth / COLUMNS;
  
  return {
    x: col * columnWidth,
    y: row * GRID_SIZE,
  };
}

/**
 * Check if two components overlap
 */
export function checkOverlap(
  comp1: GridPosition,
  comp2: GridPosition
): boolean {
  return !(
    comp1.x + comp1.w <= comp2.x ||
    comp2.x + comp2.w <= comp1.x ||
    comp1.y + comp1.h <= comp2.y ||
    comp2.y + comp2.h <= comp1.y
  );
}

/**
 * Find valid position for new component (avoiding overlaps)
 */
export function findValidPosition(
  components: FormComponent[],
  newComponent: GridPosition
): GridPosition {
  let position = { ...newComponent };
  
  // Try to place at original position
  let hasOverlap = components.some(c => checkOverlap(position, c.position));
  
  if (!hasOverlap) return position;
  
  // Try moving down until we find a spot
  for (let row = 0; row < 100; row++) {
    position.y = row;
    hasOverlap = components.some(c => checkOverlap(position, c.position));
    if (!hasOverlap) return position;
  }
  
  return position;
}

/**
 * Clamp component position within canvas bounds
 */
export function clampPosition(position: GridPosition): GridPosition {
  return {
    x: Math.max(0, Math.min(COLUMNS - position.w, position.x)),
    y: Math.max(0, position.y),
    w: Math.max(1, Math.min(COLUMNS - position.x, position.w)),
    h: Math.max(1, position.h),
  };
}
