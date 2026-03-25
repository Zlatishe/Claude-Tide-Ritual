'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useBeachStore } from '@/stores/beach-store';

interface ActiveInscription {
  id: string;
  text_content: string;
  shell_variant: number;
}

/**
 * Syncs active inscriptions with Supabase.
 * - On mount: fetches saved inscriptions → applies to current shells.
 * - On inscribe: upserts to DB.
 * - On tide release: deletes all active inscriptions from DB.
 */
export function useInscriptionSync(userId: string | null) {
  const hasHydrated = useRef(false);

  // Hydrate inscriptions from DB
  useEffect(() => {
    if (!userId || hasHydrated.current) return;

    async function hydrate() {
      try {
        const { data: inscriptions } = await supabase
          .from('shell_inscriptions')
          .select('*')
          .eq('user_id', userId);

        if (inscriptions && inscriptions.length > 0) {
          useBeachStore.getState().hydrateInscriptions(
            inscriptions.map((i) => ({
              text: i.text_content,
              shellVariant: i.shell_variant,
            }))
          );
        }

        hasHydrated.current = true;
      } catch (error) {
        console.warn('Failed to hydrate inscriptions from Supabase:', error);
      }
    }

    hydrate();
  }, [userId]);

  // Save inscription to DB
  const saveInscription = useCallback(
    async (text: string, shellVariant: number) => {
      if (!userId) return;
      try {
        await supabase.from('shell_inscriptions').insert({
          user_id: userId,
          text_content: text,
          shell_variant: shellVariant,
        });
      } catch (error) {
        console.warn('Failed to save inscription:', error);
      }
    },
    [userId]
  );

  // Clear all inscriptions from DB (on tide release)
  const clearInscriptions = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase
        .from('shell_inscriptions')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.warn('Failed to clear inscriptions:', error);
    }
  }, [userId]);

  return { saveInscription, clearInscriptions };
}
