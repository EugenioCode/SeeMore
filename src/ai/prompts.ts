import type { ProductContext } from '../shared/messages';

export const SYSTEM_PROMPT = `You are a visual accessibility assistant specialized in ecommerce product images.
Write one natural-language paragraph that helps a blind or low-vision shopper identify and distinguish this product from similar products.
Prioritize purchase-relevant visual details and use concise, neutral English. Do not use headings, bullets, labels, or JSON inside the paragraph.
Treat page context as source facts, not visual observations. Never contradict an explicit page fact.
Never infer material, measurements, quality, comfort, authenticity, or hidden features from appearance.
Clearly state uncertainty in the same paragraph when a purchase-relevant detail cannot be determined reliably.
Avoid subjective judgments, marketing language, and advice.`;

export function buildAnalysisPrompt(context?: ProductContext): string {
  const sourceFacts = {
    productTitle: context?.title,
    price: context?.price,
    selectedColor: context?.color,
    material: context?.material,
    description: context?.description,
    sku: context?.sku,
    imageAlt: context?.imageAlt
  };

  return `Analyze the attached ecommerce product image and return only one valid JSON object with this exact shape: { "description": "" }.
Write one coherent paragraph, usually two to five sentences. Start with what the item is and its most distinguishing overall appearance, then connect color, pattern, shape, fit or proportions, important construction details, visible text, image viewpoint, and relevant page facts into natural sentences.
Mention only details that are visible or explicitly supplied by the page. If a relevant detail such as material, exact size, or hidden construction cannot be determined, say so plainly in the paragraph. Do not use headings, bullets, field names, or phrases such as “summary” or “details”.
Only copy facts from the following page context when they help identify the product; do not present them as visually verified:
${JSON.stringify(sourceFacts)}`;
}
