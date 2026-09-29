import { describe, expect, it } from 'vitest';
import { EMPTY_PRODUCT_FORM, type ProductFormValues } from '../components/sims/admin/productForm';
import { validateProductForm } from '../components/sims/admin/productSchema';

const valid: ProductFormValues = { ...EMPTY_PRODUCT_FORM, name: 'Oak Desk', monthlyRent: 30, weeklyRent: 10 };

describe('validateProductForm', () => {
  it('accepts a complete form and returns numbers', () => {
    const r = validateProductForm(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.actualHeightM).toBe(0.74);
      expect(r.data.deposit).toBe(20);
    }
  });

  it('accepts the 0.74 m height that native step validation used to reject', () => {
    expect(validateProductForm({ ...valid, actualHeightM: 0.74 }).success).toBe(true);
    expect(validateProductForm({ ...valid, actualWidthM: 0.7 }).success).toBe(true);
  });

  it('treats blank numeric fields as missing, not 0', () => {
    const r = validateProductForm({ ...valid, monthlyRent: '', actualWidthM: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.errors.monthlyRent).toBe('Enter a number');
      expect(r.errors.actualWidthM).toBe('Enter a number');
    }
  });

  it('defaults a blank deposit to 0', () => {
    const r = validateProductForm({ ...valid, deposit: '' });
    expect(r.success && r.data.deposit).toBe(0);
  });

  it('requires a name and category', () => {
    const r = validateProductForm({ ...valid, name: '   ', category: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.errors.name).toBe('Product name is required');
      expect(r.errors.category).toBe('Category is required');
    }
  });

  it('enforces ranges and decimals', () => {
    const r = validateProductForm({ ...valid, widthTiles: 20, weeklyRent: 0, monthlyRent: 10.555 });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.errors.widthTiles).toBe('Max 10');
      expect(r.errors.weeklyRent).toContain('more than 0');
      expect(r.errors.monthlyRent).toBe('Max 2 decimals');
    }
  });

  it('rejects malformed asset urls but allows blank, paths and data urls', () => {
    expect(validateProductForm({ ...valid, imageUrl: 'not a url' }).success).toBe(false);
    expect(validateProductForm({ ...valid, imageUrl: '' }).success).toBe(true);
    expect(validateProductForm({ ...valid, modelUrl: '/3dObject/desk.glb' }).success).toBe(true);
    expect(validateProductForm({ ...valid, imageUrl: 'data:image/png;base64,AAAA' }).success).toBe(true);
  });
});
