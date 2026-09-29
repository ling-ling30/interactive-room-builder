import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
}

export interface PromptOptions {
  title?: string;
  message: string;
  defaultValue?: string;
  confirmLabel?: string;
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonLabel?: string;
}

export interface DialogApi {
  alert: (options: AlertOptions | string) => Promise<void>;
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  prompt: (options: PromptOptions | string, defaultValue?: string) => Promise<string | null>;
}

export const DialogContext = createContext<DialogApi | null>(null);

/** Promise-based, styled replacements for window.confirm / window.prompt. */
export function useDialogs(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialogs must be used inside <DialogProvider>');
  return ctx;
}
