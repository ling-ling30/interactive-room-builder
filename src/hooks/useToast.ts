import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error';

export interface ToastApi {
  /** Shows a transient message above everything else (errors stay a little longer). */
  toast: (text: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
