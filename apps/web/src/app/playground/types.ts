export type ComponentType = 
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

export type GridPosition = {
  x: number; // Column position (0-19)
  y: number; // Row position in 8px increments
  w: number; // Width in columns (1-20)
  h: number; // Height in grid units
};

export type FormComponent = {
  id: string;
  type: ComponentType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  position: GridPosition;
};

export type CanvasSettings = {
  width: number; // Total columns (default: 20)
  gridSize: number; // Grid unit in pixels (default: 8)
};
