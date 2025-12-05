/**
 * FormService
 * 
 * Business logic for form operations.
 * Uses DBAdapter interface to access data.
 * 
 * IMPORTANT: This service:
 * - Only talks to the database through IDBAdapter
 * - Never directly executes database queries
 * - Can be migrated to a separate microservice without changes
 * - Can work with any database implementation (MongoDB, PostgreSQL, etc.)
 */

import { getDB, type FormSchema, type CreateFormInput, type UpdateFormInput } from '@nimbl/db';

function generateSlug(title: string, id: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + id.slice(0, 6);
}

export const FormService = {
  /**
   * Create a new form
   */
  async createForm(ownerId: string, input: CreateFormInput): Promise<FormSchema> {
    const db = getDB();
    const id = crypto.randomUUID();
    const slug = generateSlug(input.title, id);

    const form: FormSchema = {
      ownerId,
      title: input.title,
      slug,
      description: input.description,
      fields: [],
      settings: {
        canvasWidth: input.settings?.canvasWidth || 20,
        gridSize: 8,
      },
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.createForm(form);
  },

  /**
   * Get form by ID (for editing)
   * Enforces ownership check
   */
  async getForm(id: string, ownerId: string): Promise<FormSchema | null> {
    const db = getDB();
    const form = await db.getForm(id);

    if (!form) return null;
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    return form;
  },

  /**
   * Get form by slug (for public viewing)
   * Only returns published forms
   */
  async getFormBySlug(slug: string): Promise<FormSchema | null> {
    const db = getDB();
    const form = await db.getFormBySlug(slug);

    if (!form || !form.published) {
      return null;
    }

    return form;
  },

  /**
   * Update form
   * Enforces ownership check
   */
  async updateForm(id: string, ownerId: string, input: UpdateFormInput): Promise<FormSchema> {
    const db = getDB();
    const form = await db.getForm(id);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const updated = await db.updateForm(id, input);
    if (!updated) {
      throw new Error('UPDATE_FAILED: Could not update form');
    }

    return updated;
  },

  /**
   * Delete form
   * Also deletes all responses
   * Enforces ownership check
   */
  async deleteForm(id: string, ownerId: string): Promise<void> {
    const db = getDB();
    const form = await db.getForm(id);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    // Delete all responses for this form
    await db.deleteResponsesByFormId(id);

    // Delete the form
    await db.deleteForm(id);
  },

  /**
   * List all forms for a user (with pagination)
   */
  async listForms(ownerId: string, options?: any): Promise<{ items: FormSchema[]; total: number }> {
    const db = getDB();
    return await db.listForms(ownerId, options);
  },

  /**
   * Publish form (make public)
   */
  async publishForm(id: string, ownerId: string): Promise<FormSchema> {
    const db = getDB();
    const form = await db.getForm(id);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const updated = await db.updateForm(id, {
      published: true,
    });

    if (!updated) {
      throw new Error('UPDATE_FAILED: Could not publish form');
    }

    return updated;
  },

  /**
   * Unpublish form (make private)
   */
  async unpublishForm(id: string, ownerId: string): Promise<FormSchema> {
    const db = getDB();
    const form = await db.getForm(id);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const updated = await db.updateForm(id, {
      published: false,
    });

    if (!updated) {
      throw new Error('UPDATE_FAILED: Could not unpublish form');
    }

    return updated;
  },

  /**
   * Get published form by slug (public endpoint - no auth required)
   */
  async getPublishedForm(slug: string): Promise<FormSchema | null> {
    const db = getDB();
    const form = await db.getFormBySlug(slug);

    if (!form || !form.published) {
      return null;
    }

    return form;
  },

  /**
   * Add component to form
   */
  async addComponent(formId: string, ownerId: string, component: any): Promise<any> {
    const db = getDB();
    const form = await db.getForm(formId);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    return await db.addComponent(formId, component);
  },

  /**
   * Update component in form
   */
  async updateComponent(formId: string, ownerId: string, componentId: string, data: any): Promise<any> {
    const db = getDB();
    const form = await db.getForm(formId);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    return await db.updateComponent(formId, componentId, data);
  },

  /**
   * Remove component from form
   */
  async removeComponent(formId: string, ownerId: string, componentId: string): Promise<void> {
    const db = getDB();
    const form = await db.getForm(formId);

    if (!form) {
      throw new Error('NOT_FOUND: Form does not exist');
    }
    if (form.ownerId !== ownerId) {
      throw new Error('UNAUTHORIZED: You do not own this form');
    }

    const removed = await db.removeComponent(formId, componentId);
    if (!removed) {
      throw new Error('NOT_FOUND: Component not found');
    }
  },
};
