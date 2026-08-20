import type { ImageReference } from '../shared/messages';

const IMAGE_TIMEOUT_MS = 15_000;
const MAX_MODEL_IMAGE_EDGE = 768;

export type LoadedImage = Blob | HTMLImageElement;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('IMAGE_CAPTURE_FAILED'));
    }, 'image/png');
  });
}

async function cropVisibleCapture(reference: ImageReference): Promise<Blob | undefined> {
  const dataUrl = reference.analysisDataUrl;
  if (!dataUrl) return undefined;
  const capture = await fetch(dataUrl).then((response) => response.blob());
  if (
    typeof reference.viewportX !== 'number'
    || typeof reference.viewportY !== 'number'
    || typeof reference.renderedWidth !== 'number'
    || typeof reference.renderedHeight !== 'number'
    || !reference.viewportWidth
    || !reference.viewportHeight
  ) return normalizeImageBlob(capture);

  const bitmap = await createImageBitmap(capture);
  try {
    const scaleX = bitmap.width / reference.viewportWidth;
    const scaleY = bitmap.height / reference.viewportHeight;
    const sourceX = Math.max(0, Math.round(reference.viewportX * scaleX));
    const sourceY = Math.max(0, Math.round(reference.viewportY * scaleY));
    const sourceWidth = Math.min(
      bitmap.width - sourceX,
      Math.round(reference.renderedWidth * scaleX)
    );
    const sourceHeight = Math.min(
      bitmap.height - sourceY,
      Math.round(reference.renderedHeight * scaleY)
    );
    if (sourceWidth <= 0 || sourceHeight <= 0) return normalizeImageBlob(capture);

    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const context = canvas.getContext('2d');
    if (!context) return normalizeImageBlob(capture);
    context.drawImage(
      bitmap,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );
    return normalizeImageBlob(await canvasToBlob(canvas));
  } finally {
    bitmap.close();
  }
}

async function normalizeImageBlob(blob: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    return blob;
  }

  try {
    const largestEdge = Math.max(bitmap.width, bitmap.height);
    if (largestEdge <= MAX_MODEL_IMAGE_EDGE) return blob;

    const scale = MAX_MODEL_IMAGE_EDGE / largestEdge;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return blob;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvasToBlob(canvas);
  } finally {
    bitmap.close();
  }
}

export async function loadImage(reference: ImageReference, signal: AbortSignal): Promise<LoadedImage> {
  const capturedImage = await cropVisibleCapture(reference);
  if (capturedImage) return capturedImage;

  const sourceUrl = reference.srcUrl;
  if (!sourceUrl) {
    throw new Error('IMAGE_MISSING');
  }

  try {
    const response = await fetch(sourceUrl, { signal });
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 0) return normalizeImageBlob(blob);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    const timeoutId = window.setTimeout(() => finish(new Error('IMAGE_TIMEOUT')), IMAGE_TIMEOUT_MS);

    function cleanup(): void {
      window.clearTimeout(timeoutId);
      signal.removeEventListener('abort', handleAbort);
      element.onload = null;
      element.onerror = null;
    }

    function finish(error?: Error): void {
      cleanup();
      if (error) reject(error);
      else resolve(element);
    }

    function handleAbort(): void {
      element.src = '';
      finish(new DOMException('Analysis cancelled', 'AbortError'));
    }

    element.decoding = 'async';
    element.alt = reference.alt ?? '';
    element.onload = () => finish();
    element.onerror = () => finish(new Error('IMAGE_LOAD_FAILED'));
    signal.addEventListener('abort', handleAbort, { once: true });
    element.src = sourceUrl;
  });

  return image;
}
