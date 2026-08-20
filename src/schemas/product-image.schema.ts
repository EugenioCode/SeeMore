import type { ProductImageAnalysis } from '../shared/messages';

export const productImageSchema: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  required: ['description'],
  properties: {
    description: { type: 'string' }
  }
};

export function isProductImageAnalysis(value: unknown): value is ProductImageAnalysis {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<ProductImageAnalysis>;
  return typeof result.description === 'string' && result.description.trim().length > 0;
}
