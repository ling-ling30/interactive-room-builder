import { useState, type ComponentProps } from 'react';

export type NumberValue = number | '';

interface NumberInputProps
  extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type' | 'inputMode' | 'min' | 'max' | 'step'> {
  value: NumberValue;
  onChange: (value: NumberValue) => void;
}

const fmt = (value: NumberValue) => (value === '' ? '' : String(value));

/** Text -> number. Blank / lone "." stay blank (never defaulted to 0). */
const parse = (text: string): NumberValue => {
  if (text === '' || text === '.') return '';
  const n = Number(text);
  return Number.isFinite(n) ? n : '';
};

/**
 * Decimal input with a dot as the decimal separator (a comma is converted to a dot).
 * Plain text field: no spinner arrows, ignores the mouse wheel, can be fully cleared (blank, not 0).
 * Sign and range checks belong to the form schema.
 */
export function NumberInput({ value, onChange, onBlur, ...props }: NumberInputProps) {
  const [raw, setRaw] = useState(fmt(value));
  const [prevValue, setPrevValue] = useState(value);

  // Follow outside changes (e.g. metres -> tiles sync) but keep in-progress text like "0." untouched
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== parse(raw)) setRaw(fmt(value));
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={raw}
      onChange={(e) => {
        const text = e.target.value.replace(',', '.');
        if (!/^\d*\.?\d*$/.test(text)) return;
        setRaw(text);
        onChange(parse(text));
      }}
      onBlur={(e) => {
        setRaw(fmt(parse(raw)));
        onBlur?.(e);
      }}
      onWheel={(e) => e.currentTarget.blur()}
    />
  );
}
