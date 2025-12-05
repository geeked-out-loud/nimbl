/**
 * Database Adapter Interface
 * 
 * This interface defines the contract for all database implementations.
 * Services talk ONLY through this interface, never directly to the database.
 * 
 * This allows swapping MongoDB → PostgreSQL → any other database
 * without changing service logic.
 */

export interface IDBAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<{ status: 'ok' | 'error'; details?: string }>;

  // Form operations
  createForm(form: any): Promise<any>;
  getForm(id: string): Promise<any | null>;
  updateForm(id: string, data: any): Promise<any>;
  deleteForm(id: string): Promise<boolean>;
  listForms(ownerId: string, options?: any): Promise<{ items: any[]; total: number }>;
  getFormBySlug(slug: string): Promise<any | null>;

  // Component operations
  addComponent(formId: string, component: any): Promise<any>;
  updateComponent(formId: string, componentId: string, data: any): Promise<any>;
  removeComponent(formId: string, componentId: string): Promise<boolean>;

  // Response operations
  createResponse(response: any): Promise<any>;
  getResponse(id: string): Promise<any | null>;
  deleteResponse(id: string): Promise<boolean>;
  listResponses(formId: string, options?: any): Promise<{ items: any[]; total: number }>;
  deleteResponsesByFormId(formId: string): Promise<number>;

  // User operations (Phase 2)
  createUser(user: any): Promise<any>;
  getUser(id: string): Promise<any | null>;
  getUserByEmail(email: string): Promise<any | null>;
  updateUser(id: string, data: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
}
