import { useCallback, useState } from 'react';
import { DEFAULT_ROOM_SETUPS, type RoomSetup } from '../data/roomSetups';
import { newId } from './ids';

const STORAGE_KEY = 'monis_sims_setups_v1';

function loadCustomSetups(): RoomSetup[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((s): s is RoomSetup => s && typeof s.id === 'string' && Array.isArray(s.items)).map(s => ({ ...s, isCustom: true }))
      : [];
  } catch {
    return [];
  }
}

function persist(list: RoomSetup[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

/** Built-in setups plus the ones saved from the studio / CMS (persisted in localStorage). */
export function useRoomSetups() {
  const [customSetups, setCustomSetups] = useState<RoomSetup[]>(loadCustomSetups);

  const update = useCallback((fn: (prev: RoomSetup[]) => RoomSetup[]) => {
    setCustomSetups(prev => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  const addSetup = useCallback((setup: RoomSetup) => update(prev => [...prev, { ...setup, isCustom: true }]), [update]);
  const updateSetup = useCallback(
    (id: string, changes: Partial<Pick<RoomSetup, 'name' | 'desc' | 'badge' | 'discountPercent'>>) =>
      update(prev => prev.map(s => (s.id === id ? { ...s, ...changes } : s))),
    [update]
  );
  const deleteSetup = useCallback((id: string) => update(prev => prev.filter(s => s.id !== id)), [update]);
  /** Copies any setup (built-in or custom) into an editable custom one. */
  const duplicateSetup = useCallback(
    (setup: RoomSetup) => update(prev => [...prev, { ...setup, id: newId('custom'), name: `${setup.name} (Copy)`, badge: 'Custom', isCustom: true }]),
    [update]
  );

  return {
    setups: [...DEFAULT_ROOM_SETUPS, ...customSetups],
    customSetups,
    addSetup,
    updateSetup,
    deleteSetup,
    duplicateSetup,
  };
}

export type RoomSetupsApi = ReturnType<typeof useRoomSetups>;
