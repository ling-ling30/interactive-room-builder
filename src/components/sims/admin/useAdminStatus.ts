import { useCallback } from 'react';
import { useToast, type ToastType } from '../../../hooks/useToast';

export type StatusType = ToastType;

/** Admin feedback goes through the global toast (visible above the product modal too). */
export function useAdminStatus() {
  const { toast } = useToast();
  const showStatus = useCallback((text: string, type: StatusType = 'success') => toast(text, type), [toast]);
  return { showStatus };
}

export type ShowStatus = ReturnType<typeof useAdminStatus>['showStatus'];
