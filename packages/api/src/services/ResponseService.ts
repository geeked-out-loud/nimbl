/**
 * ResponseService
 * 
 * Business logic for form submissions.
 * Uses DBAdapter interface to access data.
 * 
 * IMPORTANT: This service:
 * - Only talks to the database through IDBAdapter
 * - Never directly executes database queries
 * - Can be migrated to a separate microservice without changes
 * - Can work with any database implementation
 */

import { getDB, type ResponseSchema, type CreateResponseInput } from '@nimbl/db';
import { FormService } from './FormService';

export const ResponseService = {
  /**
   * Create a new form response (submission)
   * Validates that the form exists and is published
   */
  async createResponse(input: CreateResponseInput): Promise<ResponseSchema> {
    const db = getDB();

    // Verify form exists and is published
    const form = await db.getForm(input.formId);
    if (!form || !form.published) {
      throw new Error('NOT_FOUND: Form does not exist or is not published');
    }

    // Validate response values against form schema
    const validationErrors = validateResponse(form, input.values);
    if (validationErrors.length > 0) {
      const error = new Error('VALIDATION_ERROR: Invalid form submission');
      (error as any).details = validationErrors;
      throw error;
    }

    const response: ResponseSchema = {
      formId: input.formId,
      values: input.values,
      meta: input.meta,
      submittedAt: new Date(),
      createdAt: new Date(),
    };

    return await db.createResponse(response);
  },

  /**
   * Get a single response
   * Enforces form ownership check
   */
  async getResponse(id: string, ownerId: string): Promise<ResponseSchema | null> {
    const db = getDB();
    const response = await db.getResponse(id);

    if (!response) return null;

    // Verify the user owns the form
    const form = await db.getForm(response.formId);
    if (!form || form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    return response;
  },

  /**
   * List all responses for a form
   * Enforces form ownership check
   */
  async listResponses(
    formId: string,
    ownerId: string,
    options?: any
  ): Promise<{ items: ResponseSchema[]; total: number }> {
    const db = getDB();

    // Verify the user owns the form
    const form = await db.getForm(formId);
    if (!form || form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    return await db.listResponses(formId, options);
  },

  /**
   * Delete a response
   * Enforces form ownership check
   */
  async deleteResponse(id: string, ownerId: string): Promise<void> {
    const db = getDB();
    const response = await db.getResponse(id);

    if (!response) {
      throw new Error('NOT_FOUND: Response does not exist');
    }

    // Verify the user owns the form
    const form = await db.getForm(response.formId);
    if (!form || form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    await db.deleteResponse(id);
  },

  /**
   * Export responses as CSV
   * Returns CSV string
   */
  async exportResponsesAsCSV(
    formId: string,
    ownerId: string
  ): Promise<string> {
    const db = getDB();

    // Verify the user owns the form
    const form = await db.getForm(formId);
    if (!form || form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const { items } = await db.listResponses(formId, { limit: 10000 });

    if (items.length === 0) {
      return 'No responses';
    }

    // Get all unique field IDs
    const fieldIds = new Set<string>();
    items.forEach((response: any) => {
      Object.keys(response.values || {}).forEach((fieldId) => {
        fieldIds.add(fieldId);
      });
    });

    // Create CSV header
    const headers = ['Submitted At', ...Array.from(fieldIds)];
    const csv = [headers.join(',')];

    // Add rows
    items.forEach((response: any) => {
      const row = [
        new Date(response.submittedAt).toISOString(),
        ...Array.from(fieldIds).map((fieldId) => {
          const value = response.values[fieldId];
          // Escape CSV values
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }),
      ];
      csv.push(row.join(','));
    });

    return csv.join('\n');
  },

  /**
   * Export responses as JSON
   * Returns JSON string
   */
  async exportResponsesAsJSON(
    formId: string,
    ownerId: string
  ): Promise<string> {
    const db = getDB();

    // Verify the user owns the form
    const form = await db.getForm(formId);
    if (!form || form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const { items } = await db.listResponses(formId, { limit: 10000 });

    return JSON.stringify(items, null, 2);
  },
};

/**
 * Validate form submission against form schema
 */
function validateResponse(form: any, values: Record<string, any>): string[] {
  const errors: string[] = [];

  // If form has no fields, allow submission (form might be in progress)
  if (!form.fields || form.fields.length === 0) {
    return errors;
  }

  // Check all required fields are present
  form.fields.forEach((field: any) => {
    if (field.props?.required && (values[field.id] === undefined || values[field.id] === null || values[field.id] === '')) {
      errors.push(`Field "${field.props.label || field.id}" is required`);
    }
  });

  // Validate that submitted values only reference existing fields
  Object.keys(values).forEach((fieldId: string) => {
    const fieldExists = form.fields.some((f: any) => f.id === fieldId);
    if (!fieldExists) {
      errors.push(`Field "${fieldId}" does not exist in this form`);
    }
  });

  // Validate field types and constraints
  form.fields.forEach((field: any) => {
    const value = values[field.id];
    if (value === undefined || value === null) return;

    const { type, props } = field;

    // Type validation
    if (type === 'number-input' && isNaN(Number(value))) {
      errors.push(`Field "${props?.label || field.id}" must be a number`);
    }

    // Length validation
    if (props?.minLength && String(value).length < props.minLength) {
      errors.push(`Field "${props.label || field.id}" must be at least ${props.minLength} characters`);
    }
    if (props?.maxLength && String(value).length > props.maxLength) {
      errors.push(`Field "${props.label || field.id}" must not exceed ${props.maxLength} characters`);
    }

    // Numeric range validation
    if (type === 'number-input') {
      const numValue = Number(value);
      if (props?.min !== undefined && numValue < props.min) {
        errors.push(`Field "${props.label || field.id}" must be at least ${props.min}`);
      }
      if (props?.max !== undefined && numValue > props.max) {
        errors.push(`Field "${props.label || field.id}" must not exceed ${props.max}`);
      }
    }

    // Regex validation
    if (props?.regex && !new RegExp(props.regex).test(String(value))) {
      errors.push(`Field "${props.label || field.id}" format is invalid`);
    }
  });

  return errors;
}
