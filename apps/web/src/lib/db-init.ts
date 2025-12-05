import { initializeDB } from '@nimbl/db';

let isInitialized = false;

export async function ensureDBInitialized() {
  if (!isInitialized) {
    await initializeDB();
    isInitialized = true;
  }
}
