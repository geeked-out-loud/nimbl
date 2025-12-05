/**
 * Database Package Main Export
 * 
 * Exports:
 * 1. Database connection functions
 * 2. Adapter interface (for typing services)
 * 3. Types (defined in step 2)
 * 
 * Services import IDBAdapter and use getDB() to access it.
 */

export { initializeDB, getDB, closeDB } from './connection';
export type { IDBAdapter } from './adapters/IDBAdapter';
export { SupabaseAdapter } from './adapters/SupabaseAdapter';

// Types
export type {
  ComponentSchema,
  ComponentProps,
  CanvasSettings,
  FormSchema,
  CreateFormInput,
  UpdateFormInput,
  ResponseSchema,
  CreateResponseInput,
  UserSchema,
  CreateUserInput,
  UpdateUserInput,
  ValidationError,
  ValidationResult,
} from './types/index';
export { componentConstraints } from './types/constraints';
export type { ComponentConstraints } from './types/constraints';
