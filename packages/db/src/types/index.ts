/**
 * Form Component Schema
 * Represents a single component on the canvas
 */

export interface ComponentSchema {
  id: string;
  type: ComponentType;
  x: number; // grid units
  y: number; // grid units
  w: number; // width in grid units
  h: number; // height in grid units
  props: ComponentProps;
}

export type ComponentType =
  | 'text-input'
  | 'number-input'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'heading'
  | 'divider';

export interface ComponentProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // for select
  defaultValue?: string | number | boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: string; // for custom validation
  helpText?: string;
}

/**
 * Canvas Settings
 */

export interface CanvasSettings {
  canvasWidth: number; // in grid units, default 20
  gridSize: number; // fixed at 8px
}

/**
 * Form Document Schema
 * Represents a complete form in the database
 */

export interface FormSchema {
  _id?: any; // MongoDB ObjectId
  ownerId: string; // userId
  title: string;
  slug: string; // unique, generated from title
  description?: string;
  fields: ComponentSchema[]; // array of components
  settings: CanvasSettings;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form Input for creation/update
 */

export interface CreateFormInput {
  title: string;
  description?: string;
  settings?: Partial<CanvasSettings>;
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  fields?: ComponentSchema[];
  settings?: Partial<CanvasSettings>;
  published?: boolean;
  publishedAt?: Date;
}

/**
 * Response Document Schema
 * Represents a form submission
 */

export interface ResponseSchema {
  _id?: any; // MongoDB ObjectId
  formId: string; // reference to form._id
  values: Record<string, any>; // fieldId -> user's answer
  meta?: {
    ip?: string;
    userAgent?: string;
    referer?: string;
  };
  submittedAt: Date;
  createdAt: Date;
}

/**
 * Response Input for creation
 */

export interface CreateResponseInput {
  formId: string;
  values: Record<string, any>;
  meta?: Record<string, any>;
}

/**
 * User Document Schema
 * (Phase 2 - Authentication)
 */

export interface UserSchema {
  _id?: any; // MongoDB ObjectId
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string; // plain text, will be hashed
  name?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

/**
 * Validation Errors
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}
