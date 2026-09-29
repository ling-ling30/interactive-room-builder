import { z } from 'zod';
import { MODEL_TYPES } from '../../../data/modelTypes';
import type { ProductFormValues } from './productForm';

const NUMBER_ERROR = 'Enter a number';

const decimals = (max: number) => (v: number) => Math.abs(v * 10 ** max - Math.round(v * 10 ** max)) < 1e-6;

/** Number field with range and decimal limits (blank input arrives as `undefined`). */
const number = (min: number, max: number, maxDecimals = 3) =>
  z
    .number({ error: NUMBER_ERROR })
    .min(min, `Min ${min}`)
    .max(max, `Max ${max}`)
    .refine(decimals(maxDecimals), `Max ${maxDecimals} decimals`);

const money = (label: string) =>
  z
    .number({ error: NUMBER_ERROR })
    .positive(`${label} must be more than 0`)
    .max(100_000, 'Max 100000')
    .refine(decimals(2), 'Max 2 decimals');

const assetUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || /^(https?:\/\/|\/|data:|blob:)/i.test(v), 'Enter a valid URL or upload a file');

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(120, 'Max 120 characters'),
  brand: z.string().trim().max(80, 'Max 80 characters'),
  category: z.string().trim().min(1, 'Category is required').max(40, 'Max 40 characters'),
  widthTiles: number(0.5, 10, 2),
  depthTiles: number(0.5, 10, 2),
  actualWidthM: number(0.01, 10),
  actualDepthM: number(0.01, 10),
  actualHeightM: number(0.01, 5),
  weeklyRent: money('Weekly rate'),
  monthlyRent: money('Monthly rate'),
  deposit: z
    .number({ error: NUMBER_ERROR })
    .min(0, 'Min 0')
    .max(100_000, 'Max 100000')
    .refine(decimals(2), 'Max 2 decimals')
    .default(0),
  layer: z.enum(['floor', 'surface']),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Pick a valid colour'),
  modelType: z.enum(MODEL_TYPES),
  icon: z.string().trim().max(16, 'Max 16 characters'),
  description: z.string().trim().max(500, 'Max 500 characters'),
  material: z.string().trim().max(200, 'Max 200 characters'),
  imageUrl: assetUrl,
  modelUrl: assetUrl,
  modelFileName: z.string(),
  scaleMultiplier: z.number({ error: NUMBER_ERROR }).min(0.1, 'Min 0.1').max(10, 'Max 10'),
  fitMode: z.enum(['proportional', 'exact']),
});

/** Validated, normalised form data (all numbers are real numbers, strings trimmed). */
export type ProductFormData = z.infer<typeof productSchema>;

export type FormErrors = Partial<Record<keyof ProductFormValues, string>>;

export type ProductValidation =
  | { success: true; data: ProductFormData }
  | { success: false; errors: FormErrors };

const NUMERIC_KEYS = new Set<keyof ProductFormValues>(['widthTiles', 'depthTiles', 'actualWidthM', 'actualDepthM', 'actualHeightM', 'weeklyRent', 'monthlyRent', 'deposit']);

/** Validates the raw form values: blank numeric fields become "missing", first message per field is kept. */
export function validateProductForm(values: ProductFormValues): ProductValidation {
  const input = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value === '' && NUMERIC_KEYS.has(key as keyof ProductFormValues) ? undefined : value]));
  const result = productSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProductFormValues | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
