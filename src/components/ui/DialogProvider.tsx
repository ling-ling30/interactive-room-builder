import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { DialogContext, type AlertOptions, type ConfirmOptions, type DialogApi, type PromptOptions } from '../../hooks/useDialogs';

type ActiveDialog =
  | { kind: 'alert'; options: AlertOptions; resolve: () => void }
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { kind: 'prompt'; options: PromptOptions; resolve: (v: string | null) => void };

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);

  const alert = useCallback<DialogApi['alert']>(
    (options) =>
      new Promise<void>((resolve) => {
        setDialog({ kind: 'alert', options: typeof options === 'string' ? { message: options } : options, resolve });
      }),
    []
  );

  const confirm = useCallback<DialogApi['confirm']>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setDialog({ kind: 'confirm', options: typeof options === 'string' ? { message: options } : options, resolve });
      }),
    []
  );

  const prompt = useCallback<DialogApi['prompt']>(
    (options, defaultValue) =>
      new Promise<string | null>((resolve) => {
        setDialog({
          kind: 'prompt',
          options: typeof options === 'string' ? { message: options, defaultValue } : options,
          resolve,
        });
      }),
    []
  );

  const api = useMemo(() => ({ alert, confirm, prompt }), [alert, confirm, prompt]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && <DialogView key={dialog.options.message} dialog={dialog} onClose={() => setDialog(null)} />}
    </DialogContext.Provider>
  );
}

function DialogView({ dialog, onClose }: { dialog: ActiveDialog; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(dialog.kind === 'prompt' ? dialog.options.defaultValue ?? '' : '');
  useFocusTrap(panelRef, true);

  const cancel = () => {
    if (dialog.kind === 'confirm') dialog.resolve(false);
    else if (dialog.kind === 'alert') dialog.resolve();
    else dialog.resolve(null);
    onClose();
  };
  const accept = () => {
    if (dialog.kind === 'confirm') dialog.resolve(true);
    else if (dialog.kind === 'alert') dialog.resolve();
    else dialog.resolve(value);
    onClose();
  };

  const isDanger = dialog.kind === 'confirm' && dialog.options.danger;
  const title = dialog.options.title ?? (dialog.kind === 'confirm' ? 'Are you sure?' : dialog.kind === 'alert' ? 'Heads up' : 'Enter a name');

  return (
    <div
      data-hud="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#f0ece1]/70 backdrop-blur-md animate-fade-in"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={cancel}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        tabIndex={-1}
        className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 text-slate-900 outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            cancel();
          } else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
            accept();
          }
        }}
      >
        <h2 id="dialog-title" className="text-base font-extrabold tracking-tight">{title}</h2>
        <p id="dialog-message" className="text-sm text-slate-600 mt-1.5 leading-relaxed">{dialog.options.message}</p>

        {dialog.kind === 'prompt' && (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={title}
            className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        )}

        <div className="flex justify-end gap-2 mt-5">
          {dialog.kind !== 'alert' && <button
            type="button"
            onClick={cancel}
            className="apple-press px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>}
          <button
            type="button"
            onClick={accept}
            className={`apple-press px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-black'
            }`}
          >
            {('confirmLabel' in dialog.options ? dialog.options.confirmLabel : dialog.kind === 'alert' ? dialog.options.buttonLabel : undefined) ?? (dialog.kind === 'confirm' ? 'Confirm' : dialog.kind === 'alert' ? 'OK' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}
