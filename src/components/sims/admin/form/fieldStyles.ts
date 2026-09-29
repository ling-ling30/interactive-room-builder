/** Border colour classes for a field, red while it has an error. */
export const fieldBorder = (message?: string) =>
  message ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200';
