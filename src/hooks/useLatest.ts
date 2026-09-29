import { useLayoutEffect, useRef } from 'react';

/**
 * Ref that always holds the latest `value`, for reading inside animation loops and window-level
 * handlers. Updated in a layout effect (never during render) so it stays concurrent-safe.
 */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
