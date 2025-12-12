import { FieldNode, FrameNode } from './types';

/**
 * Grid utilities for Frame-based layout system
 * 
 * Frames use a 20-column grid with configurable row height.
 * Fields are positioned using grid units (columns and rows).
 */

/**
 * Convert grid column to pixels within frame
 */
export function gridColToPx(col: number, frameWidth: number, columns: number): number {
  const colWidth = frameWidth / columns;
  return col * colWidth;
}

/**
 * Convert grid row to pixels
 */
export function gridRowToPx(row: number, rowUnit: number): number {
  return row * rowUnit;
}

/**
 * Convert pixel X to grid column
 */
export function pxToGridCol(px: number, frameWidth: number, columns: number): number {
  const colWidth = frameWidth / columns;
  return Math.floor(px / colWidth);
}

/**
 * Convert pixel Y to grid row
 */
export function pxToGridRow(px: number, rowUnit: number): number {
  return Math.floor(px / rowUnit);
}

/**
 * Check if two fields overlap (in grid units)
 */
export function checkFieldOverlap(
  field1: { x: number; y: number; w: number; h: number },
  field2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    field1.x + field1.w <= field2.x ||
    field2.x + field2.w <= field1.x ||
    field1.y + field1.h <= field2.y ||
    field2.y + field2.h <= field1.y
  );
}

/**
 * Find valid position for new field (avoiding overlaps)
 */
export function findValidFieldPosition(
  existingFields: FieldNode[],
  frameId: string,
  defaultW: number,
  defaultH: number,
  columns: number
): { x: number; y: number; w: number; h: number } {
  const fieldsInFrame = existingFields.filter(f => f.layout.frameId === frameId);
  
  let position = { x: 0, y: 0, w: defaultW, h: defaultH };
  
  // Try to place at top-left first
  let hasOverlap = fieldsInFrame.some(f => checkFieldOverlap(position, f.layout));
  
  if (!hasOverlap) return position;
  
  // Try moving down until we find a spot
  for (let row = 0; row < 100; row++) {
    position.y = row;
    hasOverlap = fieldsInFrame.some(f => checkFieldOverlap(position, f.layout));
    if (!hasOverlap) return position;
  }
  
  return position;
}

/**
 * Clamp field position within frame bounds
 */
export function clampFieldPosition(
  position: { x: number; y: number; w: number; h: number },
  columns: number
): { x: number; y: number; w: number; h: number } {
  return {
    x: Math.max(0, Math.min(columns - position.w, position.x)),
    y: Math.max(0, position.y),
    w: Math.max(1, Math.min(columns - position.x, position.w)),
    h: Math.max(1, position.h),
  };
}

/**
 * Convert frame-local pixel coordinates to world coordinates
 */
export function frameLocalToWorld(
  localX: number,
  localY: number,
  frame: FrameNode
): { x: number; y: number } {
  return {
    x: frame.layout.x + localX,
    y: frame.layout.y + localY,
  };
}

/**
 * Convert world coordinates to frame-local coordinates
 */
export function worldToFrameLocal(
  worldX: number,
  worldY: number,
  frame: FrameNode
): { x: number; y: number } {
  return {
    x: worldX - frame.layout.x,
    y: worldY - frame.layout.y,
  };
}
