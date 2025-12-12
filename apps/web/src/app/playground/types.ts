/**
 * New Frame/Field Architecture
 * 
 * - Frames are containers positioned in world space (px)
 * - Fields are positioned inside frames using grid units
 * - Clean separation between world coordinates and grid layout
 */

export type FormId = string;
export type FrameId = string;
export type ElementId = string;

export type BaseNode = {
  id: string;
  type: string;
  parentId: string | null;
};

export type FrameNode = BaseNode & {
  type: 'frame';
  name: string;
  
  // World coordinates (px)
  layout: {
    x: number;  // world X of frame's top-left
    y: number;  // world Y of frame's top-left
    w: number;  // width in px
    h: number;  // height in px
  };
  
  // Grid system for children
  grid: {
    columns: number;  // always 20
    rowUnit: number;  // px height per row
  };
};

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file';

export type FieldNode = BaseNode & {
  type: FieldType;
  
  props: {
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  };
  
  // Layout inside frame (grid units)
  layout: {
    frameId: FrameId;
    x: number;  // column index (0..columns-1)
    y: number;  // row index
    w: number;  // column span (>=1)
    h: number;  // row span (>=1)
  };
};

export type FormDefinition = {
  id: FormId;
  title: string;
  rootFrameId: FrameId;
  frames: Record<FrameId, FrameNode>;
  fields: Record<ElementId, FieldNode>;
};

// Legacy type for backward compatibility during migration
export type ComponentType = FieldType;
export type GridPosition = { x: number; y: number; w: number; h: number };
export type FormComponent = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  position: GridPosition;
};
