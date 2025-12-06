/**
 * Playground Canvas Controls & Configuration
 * Centralized control scheme for the form builder canvas
 */

export const CANVAS_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 10000,
  CANVAS_HEIGHT: 10000,
  
  // Grid system
  GRID_SIZE: 8, // pixels per grid unit
  GRID_COLUMNS: 20, // number of columns for snapping
  
  // Zoom settings
  ZOOM_MIN: 10, // 10%
  ZOOM_MAX: 500, // 500%
  ZOOM_DEFAULT: 100,
  ZOOM_STEP: 10, // zoom increment/decrement
  ZOOM_WHEEL_SENSITIVITY: 0.1, // how fast ctrl+scroll zooms
  
  // Component defaults
  DEFAULT_COMPONENT_WIDTH: 6, // grid columns
  DEFAULT_COMPONENT_HEIGHT: 2, // grid rows
  DEFAULT_TEXTAREA_HEIGHT: 4, // grid rows
  
  // Pan limits (prevents infinite panning)
  ENABLE_PAN_BOUNDARIES: true,
} as const;

/**
 * Keyboard & Mouse Controls
 */
export const CONTROLS = {
  // Canvas Navigation
  PAN: {
    mouse: 'Click + Drag (on canvas background)',
    description: 'Pan/move the canvas viewport',
  },
  ZOOM_IN: {
    keyboard: ['Ctrl/Cmd + Scroll Up', 'Ctrl/Cmd + +'],
    button: '+ button',
    description: 'Zoom in on the canvas',
  },
  ZOOM_OUT: {
    keyboard: ['Ctrl/Cmd + Scroll Down', 'Ctrl/Cmd + -'],
    button: '- button',
    description: 'Zoom out of the canvas',
  },
  RESET_VIEW: {
    keyboard: 'Ctrl/Cmd + 0',
    button: 'Reset button',
    description: 'Reset zoom to 100% and center canvas',
  },
  
  // Component Manipulation
  SELECT: {
    mouse: 'Click on component',
    description: 'Select a component to edit',
  },
  DRAG: {
    mouse: 'Click + Drag (on component or drag handle)',
    description: 'Move component on canvas',
  },
  RESIZE: {
    mouse: 'Drag resize handles (corners/edges)',
    description: 'Resize component dimensions',
  },
  DELETE: {
    keyboard: ['Delete', 'Backspace'],
    button: 'Delete icon (on selected component)',
    description: 'Delete selected component',
  },
  DUPLICATE: {
    keyboard: 'Ctrl/Cmd + D',
    button: 'Duplicate icon (in properties panel)',
    description: 'Duplicate selected component',
  },
  DESELECT: {
    mouse: 'Click on canvas background',
    keyboard: 'Escape',
    description: 'Deselect current component',
  },
  
  // Editing
  UNDO: {
    keyboard: 'Ctrl/Cmd + Z',
    button: 'Undo button',
    description: 'Undo last action',
  },
  REDO: {
    keyboard: 'Ctrl/Cmd + Shift + Z',
    button: 'Redo button',
    description: 'Redo last undone action',
  },
  
  // View
  TOGGLE_GRID: {
    keyboard: 'Ctrl/Cmd + G',
    button: 'Grid button',
    description: 'Show/hide grid overlay',
  },
  
  // General
  SAVE: {
    keyboard: 'Ctrl/Cmd + S',
    button: 'Publish button',
    description: 'Save/publish form',
  },
  PREVIEW: {
    keyboard: 'Ctrl/Cmd + P',
    button: 'Preview button',
    description: 'Preview form',
  },
} as const;

/**
 * Event handler helpers
 */
export const isModifierKey = (e: KeyboardEvent | MouseEvent | WheelEvent): boolean => {
  return e.ctrlKey || e.metaKey;
};

export const isShiftKey = (e: KeyboardEvent | MouseEvent): boolean => {
  return e.shiftKey;
};

export const shouldPreventDefault = (e: WheelEvent | KeyboardEvent, inCanvas: boolean): boolean => {
  // Prevent default browser behavior for specific controls when in canvas
  if (!inCanvas) return false;
  
  if (e.type === 'wheel' && isModifierKey(e)) {
    // Prevent browser zoom when ctrl+scroll in canvas
    return true;
  }
  
  if (e.type === 'keydown') {
    const key = (e as KeyboardEvent).key;
    
    // Prevent browser behavior for our shortcuts
    if (isModifierKey(e) && ['s', 'p', 'g', 'z', 'd', '0', '+', '-'].includes(key.toLowerCase())) {
      return true;
    }
    
    // Prevent delete/backspace from navigating back
    if (['Delete', 'Backspace'].includes(key)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Grid snap utility
 */
export const snapToGrid = (value: number, gridSize: number = CANVAS_CONFIG.GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Zoom calculation helpers
 */
export const clampZoom = (zoom: number): number => {
  return Math.min(CANVAS_CONFIG.ZOOM_MAX, Math.max(CANVAS_CONFIG.ZOOM_MIN, zoom));
};

export const calculateZoomStep = (currentZoom: number, direction: 'in' | 'out'): number => {
  const step = CANVAS_CONFIG.ZOOM_STEP;
  const newZoom = direction === 'in' ? currentZoom + step : currentZoom - step;
  return clampZoom(newZoom);
};
