'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useJarStore } from '@/stores/jar-store';
import type { JarStone } from '@/types/stone';

/**
 * Syncs jar store with Supabase.
 * - On mount (when userId is available): fetches stones + count from DB → hydrates store.
 * - Subscribes to store changes: when stones are added, persists to DB.
 */
export function useJarSync(userId: string | null) {
  const hasHydrated = useRef(false);
  const previousCount = useRef(0);

  // Hydrate jar from DB on auth
  useEffect(() => {
    if (!userId || hasHydrated.current) return;

    async function hydrate() {
      try {
        // Fetch all stones
        const { data: stones } = await supabase
          .from('jar_stones')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        const count = stones?.length ?? 0;
        const jarStones: JarStone[] = (stones ?? []).map((s) => ({
          id: s.id,
          variant: s.variant,
          colorSeed: Number(s.color_seed),
          x: Number(s.x),
          y: Number(s.y),
          rotation: Number(s.rotation),
          scale: Number(s.scale),
        }));

        if (count > 0) {
          useJarStore.getState().hydrateJar(count, jarStones);
        }

        // CRITICAL: set previousCount BEFORE hasHydrated so the subscription
        // doesn't re-persist all existing stones as "new"
        previousCount.current = count;
        hasHydrated.current = true;

        // Ensure user_profiles row exists (may be missing if trigger failed)
        await supabase
          .from('user_profiles')
          .upsert({ id: userId, stone_count: count, updated_at: new Date().toISOString() });
      } catch (error) {
        console.warn('Failed to hydrate jar from Supabase:', error);
      }
    }

    hydrate();
  }, [userId]);

  // Subscribe to store changes — persist new stones to DB
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = useJarStore.subscribe((state) => {
      // Only persist when stone count increases (new stones added)
      if (state.stoneCount > previousCount.current && hasHydrated.current) {
        const newStones = state.stones.slice(previousCount.current);
        previousCount.current = state.stoneCount;

        persistNewStones(userId, newStones, state.stoneCount);
      }
    });

    return unsubscribe;
  }, [userId]);
}

async function persistNewStones(
  userId: string,
  newStones: JarStone[],
  totalCount: number
) {
  try {
    // Insert new stones
    if (newStones.length > 0) {
      await supabase.from('jar_stones').insert(
        newStones.map((s) => ({
          user_id: userId,
          variant: s.variant,
          color_seed: s.colorSeed,
          x: s.x,
          y: s.y,
          rotation: s.rotation,
          scale: s.scale,
        }))
      );
    }

    // Update profile stone count
    await supabase
      .from('user_profiles')
      .update({ stone_count: totalCount, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.warn('Failed to persist stones to Supabase:', error);
  }
}
