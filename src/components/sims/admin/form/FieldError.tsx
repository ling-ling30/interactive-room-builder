import React from 'react';

/** Inline validation message shown under a form field. */
export const FieldError: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <p role="alert" className="mt-1 text-[10px] font-semibold text-rose-600">
      {message}
    </p>
  ) : null;
