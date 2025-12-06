'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getFormStorage, type LocalForm } from './formStorage';

type AutosaveOptions = {
  debounceMs?: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
};

/**
 * Debounced Autosave Hook
 * 
 * Automatically saves form to IndexedDB with debouncing
 * Prevents excessive writes during rapid editing
 * 
 * Usage:
 *   const { save, saving } = useAutosave(formId, formData, { debounceMs: 2000 });
 */
export function useAutosave(
  formId: string,
  formData: Omit<LocalForm, 'id' | 'lastSaved' | 'synced'>,
  options: AutosaveOptions = {}
) {
  const { debounceMs = 2000, onSave, onError } = options;
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const savingRef = useRef(false);
  const lastSaveRef = useRef<string>('');

  const save = useCallback(async (immediate = false) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const saveData = { id: formId, ...formData };
    const dataHash = JSON.stringify(saveData);

    // Skip if data hasn't changed
    if (dataHash === lastSaveRef.current && !immediate) {
      return;
    }

    const doSave = async () => {
      if (savingRef.current) return;
      savingRef.current = true;

      try {
        const storage = getFormStorage();
        await storage.saveForm(saveData);
        lastSaveRef.current = dataHash;
        onSave?.();
      } catch (error) {
        onError?.(error as Error);
        console.error('Autosave failed:', error);
      } finally {
        savingRef.current = false;
      }
    };

    if (immediate) {
      await doSave();
    } else {
      timeoutRef.current = setTimeout(doSave, debounceMs);
    }
  }, [formId, formData, debounceMs, onSave, onError]);

  // Auto-save on data change
  useEffect(() => {
    save();
  }, [save]);

  // Save immediately on unmount - using synchronous approach
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Synchronous save for unmount - can't await in cleanup
      if (savingRef.current) return; // Skip if already saving
      
      const saveData = { id: formId, ...formData };
      const dataHash = JSON.stringify(saveData);
      
      // Skip if data hasn't changed
      if (dataHash === lastSaveRef.current) return;
      
      // Fire-and-forget save (best effort on unmount)
      const storage = getFormStorage();
      storage.saveForm(saveData).catch((err) => {
        console.error('Unmount save failed:', err);
      });
    };
  }, [formId, formData]);

  return {
    save: () => save(true),
    saving: savingRef.current,
  };
}
