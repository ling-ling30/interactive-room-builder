import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ToastContext, type ToastApi, type ToastType } from '../../hooks/useToast';

interface ToastItem {
  id: number;
  text: string;
  type: ToastType;
}

const DURATION_MS: Record<ToastType, number> = { success: 3500, error: 5500 };
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastApi['toast']>(
    (text, type = 'success') => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, text, type }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS[type]));
    },
    [dismiss]
  );

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        data-hud="true"
        role="region"
        aria-label="Notifications"
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] flex flex-col gap-2 w-[min(92vw,26rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto animate-fade-in flex items-start gap-2.5 rounded-2xl border bg-white px-3.5 py-3 shadow-xl ${
              t.type === 'error' ? 'border-rose-200' : 'border-emerald-200'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            )}
            <p className="flex-1 text-xs font-semibold text-slate-800 leading-snug">{t.text}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="apple-press -m-1 p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
