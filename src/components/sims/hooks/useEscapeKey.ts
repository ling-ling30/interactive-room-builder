import { useEffect } from 'react';
import { useLatest } from '../../../hooks/useLatest';

// Open dialogs register here so a single Esc press only closes the topmost one.
const escapeStack: symbol[] = [];

/** Calls `onEscape` when Esc is pressed while `active`; with stacked dialogs only the most recently opened reacts. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const handlerRef = useLatest(onEscape);

  useEffect(() => {
    if (!active) return;
    const id = Symbol('escape');
    escapeStack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || escapeStack[escapeStack.length - 1] !== id) return;
      e.stopPropagation();
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      const idx = escapeStack.indexOf(id);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
  }, [active, handlerRef]);
}
