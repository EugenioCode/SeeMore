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
      const rootCandidates = Array.isArray(parsed) ? parsed : [parsed];
      const candidates = rootCandidates.flatMap((value) => {
        if (!value || typeof value !== 'object') return [value];
        const graph = (value as Record<string, unknown>)['@graph'];
        return Array.isArray(graph) ? [value, ...graph] : [value];
      });
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

function absoluteUrl(value: string): string {
  try {
    return new URL(value, document.baseURI).href;
  } catch {
    return value;
  }
}

function structuredImageUrl(structuredData?: Record<string, unknown>): string | undefined {
  const value = structuredData?.image;
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === 'string') return absoluteUrl(first);
  if (first && typeof first === 'object') {
    const url = (first as Record<string, unknown>).url
      ?? (first as Record<string, unknown>).contentUrl;
    if (typeof url === 'string') return absoluteUrl(url);
  }
  return undefined;
}

function imageReference(element: HTMLImageElement): ImageReference {
  const rect = element.getBoundingClientRect();
  return {
    srcUrl: element.currentSrc || element.src,
    alt: element.alt.trim() || undefined,
    width: element.naturalWidth || element.width || undefined,
    height: element.naturalHeight || element.height || undefined,
    viewportX: rect.left,
    viewportY: rect.top,
    renderedWidth: rect.width,
    renderedHeight: rect.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  };
}

function findTargetImage(
  requestedImage: ImageReference | undefined,
  structuredData: Record<string, unknown> | undefined
): ImageReference | undefined {
  const images = Array.from(document.images);
  if (requestedImage?.srcUrl) {
    const requestedUrl = absoluteUrl(requestedImage.srcUrl);
    const matched = images.find((image) =>
      absoluteUrl(image.currentSrc || image.src) === requestedUrl
      || absoluteUrl(image.src) === requestedUrl
    );
    if (matched) return { ...requestedImage, ...imageReference(matched) };
    return { ...requestedImage, srcUrl: requestedUrl };
  }

  const productImageUrl = structuredImageUrl(structuredData);
  if (productImageUrl) {
    const matched = images.find((image) =>
      absoluteUrl(image.currentSrc || image.src) === productImageUrl
      || absoluteUrl(image.src) === productImageUrl
    );
    if (matched) return imageReference(matched);
    return { srcUrl: productImageUrl };
  }

  const visibleImages = images.filter((image) => {
    const rect = image.getBoundingClientRect();
    const style = getComputedStyle(image);
    return rect.width >= 160
      && rect.height >= 160
      && rect.bottom > 0
      && rect.top < window.innerHeight
      && style.display !== 'none'
      && style.visibility !== 'hidden';
  });
  const largest = visibleImages.sort((left, right) => {
    const leftRect = left.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    return rightRect.width * rightRect.height - leftRect.width * leftRect.height;
  })[0];
  return largest ? imageReference(largest) : undefined;
}

function collectPageData(image?: ImageReference): {
  context: ProductContext;
  image?: ImageReference;
} {
  const structuredData = findStructuredProduct();
  const targetImage = findTargetImage(image, structuredData);
  const productName = structuredData?.name;
  const productColor = structuredData?.color;
  const productMaterial = structuredData?.material;

  return {
    image: targetImage,
    context: {
      title: typeof productName === 'string'
        ? productName.slice(0, 500)
        : firstText(['h1', '[itemprop="name"]', '[data-product-title]']) ?? document.title,
      price: firstText(['[itemprop="price"]', '[data-price]', '.price']),
      color: typeof productColor === 'string'
        ? productColor.slice(0, 200)
        : firstText(['[itemprop="color"]', '[data-color]']),
      material: typeof productMaterial === 'string'
        ? productMaterial.slice(0, 300)
        : firstText(['[itemprop="material"]', '[data-material]']),
      description: firstText(['[itemprop="description"]', '[data-description]']),
      imageAlt: targetImage?.alt,
      structuredData
    }
  };
}

if (!window.__seeMoreContentScriptLoaded) {
  window.__seeMoreContentScriptLoaded = true;
  chrome.runtime.onMessage.addListener(
    (message: RuntimeMessage, _sender, sendResponse: (response: RuntimeResponse) => void) => {
      if (message.type !== 'COLLECT_PAGE_CONTEXT') return false;
      sendResponse(collectPageData(message.image));
      return false;
    }
  );
}
