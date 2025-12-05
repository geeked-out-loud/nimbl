/**
 * Component Type Constraints
 * 
 * Defines min/max dimensions and resizable directions for each component type
 * Used by canvas engine for drag/resize validation
 */

import { ComponentType } from './index';

export interface ComponentConstraints {
  minWidth: number; // in grid units
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable: 'all' | 'horizontal' | 'vertical' | 'none';
}

export const componentConstraints: Record<ComponentType, ComponentConstraints> = {
  'text-input': {
    minWidth: 3,
    minHeight: 1,
    resizable: 'horizontal',
  },
  'number-input': {
    minWidth: 3,
    minHeight: 1,
    resizable: 'horizontal',
  },
  'select': {
    minWidth: 3,
    minHeight: 1,
    resizable: 'horizontal',
  },
  'checkbox': {
    minWidth: 2,
    minHeight: 1,
    resizable: 'none',
  },
  'textarea': {
    minWidth: 4,
    minHeight: 2,
    resizable: 'all',
  },
  'heading': {
    minWidth: 5,
    minHeight: 1,
    resizable: 'horizontal',
  },
  'divider': {
    minWidth: 1,
    minHeight: 1,
    maxHeight: 1,
    resizable: 'horizontal',
  },
};
