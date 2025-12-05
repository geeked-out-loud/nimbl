import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDBAdapter } from './IDBAdapter';

/**
 * Supabase PostgreSQL Concrete Implementation of IDBAdapter
 * 
 * All Supabase-specific logic is isolated here.
 * Services and routes don't change - they only use IDBAdapter interface.
 */

export class SupabaseAdapter implements IDBAdapter {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async connect(): Promise<void> {
    try {
      // Test connection
      const { error } = await this.client.from('forms').select('count()', { count: 'exact', head: true });
      if (error) throw error;
      console.log('✓ Supabase connected');
    } catch (error) {
      console.error('✗ Supabase connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // Supabase client doesn't need explicit disconnection
    console.log('✓ Supabase disconnected');
  }

  async health(): Promise<{ status: 'ok' | 'error'; details?: string }> {
    try {
      const { error } = await this.client.from('forms').select('count()', { count: 'exact', head: true });
      if (error) throw error;
      return { status: 'ok' };
    } catch (error: any) {
      return { status: 'error', details: error.message };
    }
  }

  // ============ Forms ============

  async createForm(form: any): Promise<any> {
    const { data, error } = await this.client
      .from('forms')
      .insert({
        id: form.id,
        owner_id: form.ownerId,
        title: form.title,
        slug: form.slug,
        description: form.description,
        components: form.fields || form.components || [],
        settings: form.settings,
        published: form.published || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create form: ${error.message}`);
    return this.mapFormFromDB(data);
  }

  async getForm(id: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data ? this.mapFormFromDB(data) : null;
  }

  async updateForm(id: string, data: any): Promise<any> {
    // Map camelCase to snake_case
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.fields !== undefined) updateData.components = data.fields;
    if (data.settings !== undefined) updateData.settings = data.settings;
    if (data.published !== undefined) updateData.published = data.published;

    const { data: result, error } = await this.client
      .from('forms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update form: ${error.message}`);
    return this.mapFormFromDB(result);
  }

  async deleteForm(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete form: ${error.message}`);
    return true;
  }

  async listForms(ownerId: string, options?: any): Promise<{ items: any[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;
    const sort = options?.sort || 'created_at';
    const order = options?.order === 'asc' ? 'asc' : 'desc';

    // Get total count
    const { count, error: countError } = await this.client
      .from('forms')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId);

    if (countError) throw countError;

    // Get paginated results
    const { data, error } = await this.client
      .from('forms')
      .select('*')
      .eq('owner_id', ownerId)
      .order(sort, { ascending: order === 'asc' })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    return {
      items: (data || []).map((f: any) => this.mapFormFromDB(f)),
      total: count || 0,
    };
  }

  async getFormBySlug(slug: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('forms')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapFormFromDB(data) : null;
  }

  // ============ Components ============

  async addComponent(formId: string, component: any): Promise<any> {
    // Get form first
    const form = await this.getForm(formId);
    if (!form) throw new Error('Form not found');

    // Add to fields array
    const fields = form.fields || [];
    const newComponent = {
      id: crypto.randomUUID(),
      ...component,
      createdAt: new Date().toISOString(),
    };
    fields.push(newComponent);

    // Update form
    await this.updateForm(formId, { fields });
    return newComponent;
  }

  async updateComponent(formId: string, componentId: string, data: any): Promise<any> {
    const form = await this.getForm(formId);
    if (!form) throw new Error('Form not found');

    const fields = form.fields || [];
    const index = fields.findIndex((c: any) => c.id === componentId);
    if (index === -1) throw new Error('Component not found');

    fields[index] = { ...fields[index], ...data, updatedAt: new Date().toISOString() };
    await this.updateForm(formId, { fields });

    return fields[index];
  }

  async removeComponent(formId: string, componentId: string): Promise<boolean> {
    const form = await this.getForm(formId);
    if (!form) throw new Error('Form not found');

    const fields = form.fields || [];
    const filtered = fields.filter((c: any) => c.id !== componentId);

    if (filtered.length === fields.length) return false; // Not found

    await this.updateForm(formId, { fields: filtered });
    return true;
  }

  // ============ Responses ============

  async createResponse(response: any): Promise<any> {
    const { data, error } = await this.client
      .from('responses')
      .insert({
        ...response,
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create response: ${error.message}`);
    return this.mapResponseFromDB(data);
  }

  async getResponse(id: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('responses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapResponseFromDB(data) : null;
  }

  async deleteResponse(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from('responses')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return (count || 0) > 0;
  }

  async listResponses(formId: string, options?: any): Promise<{ items: any[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await this.client
      .from('responses')
      .select('*', { count: 'exact' })
      .eq('form_id', formId);

    if (countError) throw countError;

    // Get paginated results
    const { data, error } = await this.client
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    return {
      items: (data || []).map((r: any) => this.mapResponseFromDB(r)),
      total: count || 0,
    };
  }

  async deleteResponsesByFormId(formId: string): Promise<number> {
    const { error, count } = await this.client
      .from('responses')
      .delete()
      .eq('form_id', formId)
      .select();

    if (error) throw error;
    return count || 0;
  }

  // ============ Users ============

  async createUser(user: any): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .insert({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.mapUserFromDB(data);
  }

  async getUser(id: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapUserFromDB(data) : null;
  }

  async getUserByEmail(email: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapUserFromDB(data) : null;
  }

  async updateUser(id: string, data: any): Promise<any> {
    const { data: result, error } = await this.client
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return this.mapUserFromDB(result);
  }

  async deleteUser(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from('users')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    return (count || 0) > 0;
  }

  // ============ Helpers ============

  private mapFormFromDB(data: any): any {
    return {
      _id: data.id,
      id: data.id,
      ownerId: data.owner_id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      fields: data.components || [],
      published: data.published || false,
      settings: data.settings,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapResponseFromDB(data: any): any {
    return {
      _id: data.id,
      id: data.id,
      formId: data.form_id,
      values: data.values,
      submittedAt: data.submitted_at,
      createdAt: data.created_at,
    };
  }

  private mapUserFromDB(data: any): any {
    return {
      _id: data.id,
      id: data.id,
      email: data.email,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
