import type {
  ImageReference,
  ProductContext,
  RuntimeMessage,
  RuntimeResponse
} from '../shared/messages';

declare global {
  interface Window {
    __seeMoreContentScriptLoaded?: boolean;
  }
}

function firstText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();
    if (text) return text.slice(0, 1000);
  }
  return undefined;
}

function findStructuredProduct(): Record<string, unknown> | undefined {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of scripts) {
    try {
      const parsed: unknown = JSON.parse(script.textContent ?? '');
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const product = candidates.find(
        (value): value is Record<string, unknown> =>
          typeof value === 'object' && value !== null &&
          (value as Record<string, unknown>)['@type'] === 'Product'
      );
      if (product) return product;
    } catch {
      // Ignore malformed JSON-LD and continue with visible text.
    }
  }
  return undefined;
}

function collectContext(image?: ImageReference): ProductContext {
  const structuredData = findStructuredProduct();
  const productName = structuredData?.name;
  const productColor = structuredData?.color;
  const productMaterial = structuredData?.material;

  return {
    title: typeof productName === 'string'
      ? productName.slice(0, 500)
      : firstText(['h1', '[itemprop="name"]', '[data-product-title]']),
    price: firstText(['[itemprop="price"]', '[data-price]', '.price']),
    color: typeof productColor === 'string'
      ? productColor.slice(0, 200)
      : firstText(['[itemprop="color"]', '[data-color]']),
    material: typeof productMaterial === 'string'
      ? productMaterial.slice(0, 300)
      : firstText(['[itemprop="material"]', '[data-material]']),
    description: firstText(['[itemprop="description"]', '[data-description]']),
    imageAlt: image?.alt,
    structuredData
  };
}

if (!window.__seeMoreContentScriptLoaded) {
  window.__seeMoreContentScriptLoaded = true;
  chrome.runtime.onMessage.addListener(
    (message: RuntimeMessage, _sender, sendResponse: (response: RuntimeResponse) => void) => {
      if (message.type !== 'COLLECT_PAGE_CONTEXT') return false;
      sendResponse({ context: collectContext(message.image) });
      return false;
    }
  );
}
