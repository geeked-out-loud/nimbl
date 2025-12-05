import { IDBAdapter } from './adapters/IDBAdapter';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';

/**
 * Database Connection Manager
 * 
 * Manages a single database adapter instance.
 * Services request the adapter through this manager.
 * 
 * This pattern allows easy swapping of implementations:
 * - Change to a different adapter implementing IDBAdapter
 * - All services automatically use the new adapter
 */

let dbAdapter: IDBAdapter | null = null;

export async function initializeDB(): Promise<IDBAdapter> {
  if (dbAdapter) {
    return dbAdapter;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
  }
  
  dbAdapter = new SupabaseAdapter(supabaseUrl, supabaseKey);
  await dbAdapter.connect();
  
  return dbAdapter;
}

export function getDB(): IDBAdapter {
  if (!dbAdapter) {
    throw new Error(
      'Database not initialized. Call initializeDB() before accessing the database.'
    );
  }
  return dbAdapter;
}

export async function closeDB(): Promise<void> {
  if (dbAdapter) {
    await dbAdapter.disconnect();
    dbAdapter = null;
  }
}
