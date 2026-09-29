import { useCallback, useState } from 'react';

export type StatusType = 'success' | 'error';

/** Transient status banner (auto clears after 3.5s). */
export function useAdminStatus() {
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: StatusType } | null>(null);

  const showStatus = useCallback((text: string, type: StatusType = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 3500);
  }, []);

  return { statusMsg, showStatus };
}

export type ShowStatus = ReturnType<typeof useAdminStatus>['showStatus'];
