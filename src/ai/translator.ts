import type { ProductImageAnalysis } from '../shared/messages';

export type DownloadProgressHandler = (progress: number) => void;

let cachedAvailability: AIAvailability | undefined;

function translatorOptions(
  signal: AbortSignal,
  onDownloadProgress: DownloadProgressHandler
): TranslatorOptions {
  return {
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    signal,
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (event) => onDownloadProgress(event.loaded));
    }
  };
}

export async function getTranslatorAvailability(): Promise<AIAvailability> {
  if (cachedAvailability) return cachedAvailability;
  if (typeof Translator === 'undefined' || !Translator) return 'unavailable';
  cachedAvailability = await Translator.availability({ sourceLanguage: 'en', targetLanguage: 'zh' });
  return cachedAvailability;
}

export async function translateAnalysis(
  result: ProductImageAnalysis,
  signal: AbortSignal,
  onDownloadProgress: DownloadProgressHandler
): Promise<ProductImageAnalysis> {
  if (typeof Translator === 'undefined' || !Translator) throw new Error('TRANSLATOR_UNAVAILABLE');
  const translator = await Translator.create(translatorOptions(signal, onDownloadProgress));
  try {
    const translate = (value: string) => value ? translator.translate(value, { signal }) : Promise.resolve('');
    return { description: await translate(result.description) };
  } finally {
    translator.destroy();
  }
}
