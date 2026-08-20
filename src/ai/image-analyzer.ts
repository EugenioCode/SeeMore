import { isProductImageAnalysis, productImageSchema } from '../schemas/product-image.schema';
import type { AnalyzeImageRequest, ProductImageAnalysis } from '../shared/messages';
import { loadImage, type LoadedImage } from './image-loader';
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts';
import { getTranslatorAvailability, translateAnalysis } from './translator';

export interface AnalysisCallbacks {
  onState: (state: 'PREPARING_MODEL' | 'DOWNLOADING_MODEL' | 'IMAGE_LOADING' | 'ANALYZING' | 'TRANSLATING') => void;
  onDownloadProgress: (progress: number) => void;
}

export interface AnalysisOutput {
  result: ProductImageAnalysis;
  language: 'zh' | 'en';
  translationWarning?: string;
}

const modelCapabilities: LanguageModelOptions = {
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image' }
  ],
  expectedOutputs: [{ type: 'text', languages: ['en'] }]
};

let cachedLanguageModelAvailability: AIAvailability | undefined;
let baseSessionPromise: Promise<LanguageModelSession> | undefined;

function promptInput(prompt: string, image: LoadedImage): LanguageModelPrompt[] {
  return [{
    role: 'user',
    content: [
      { type: 'text', value: prompt },
      { type: 'image', value: image }
    ]
  }];
}

function parseModelJson(response: string): unknown {
  const trimmed = response.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    if (!fenced) throw new Error('INVALID_MODEL_RESPONSE');
    return JSON.parse(fenced);
  }
}

async function promptWithCompatibilityFallback(
  session: LanguageModelSession,
  input: LanguageModelPrompt[],
  signal: AbortSignal
): Promise<string> {
  try {
    return await session.prompt(input, {
      responseConstraint: productImageSchema,
      omitResponseConstraintInput: true,
      signal
    });
  } catch (structuredError) {
    if (
      structuredError instanceof DOMException
      && structuredError.name === 'AbortError'
      && signal.aborted
    ) {
      throw structuredError;
    }
    try {
      return await session.prompt(input, { signal });
    } catch {
      throw structuredError;
    }
  }
}

export async function getAnalysisAvailability(): Promise<{
  languageModel: AIAvailability;
  translator: AIAvailability;
}> {
  const [languageModel, translator] = await Promise.all([
    getLanguageModelAvailability(),
    getTranslatorAvailability()
  ]);
  return { languageModel, translator };
}

async function getLanguageModelAvailability(): Promise<AIAvailability> {
  if (cachedLanguageModelAvailability) return cachedLanguageModelAvailability;
  if (typeof LanguageModel === 'undefined' || !LanguageModel) {
    cachedLanguageModelAvailability = 'unavailable';
    return cachedLanguageModelAvailability;
  }
  cachedLanguageModelAvailability = await LanguageModel.availability(modelCapabilities);
  return cachedLanguageModelAvailability;
}

async function getBaseSession(
  callbacks: AnalysisCallbacks
): Promise<LanguageModelSession> {
  if (baseSessionPromise) return baseSessionPromise;
  if (typeof LanguageModel === 'undefined' || !LanguageModel) {
    throw new Error('LANGUAGE_MODEL_UNAVAILABLE');
  }

  callbacks.onState('PREPARING_MODEL');
  const availability = await getLanguageModelAvailability();
  if (availability === 'unavailable') throw new Error('LANGUAGE_MODEL_UNAVAILABLE');
  if (availability !== 'available') callbacks.onState('DOWNLOADING_MODEL');

  baseSessionPromise = LanguageModel.create({
    ...modelCapabilities,
    initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }],
    monitor(monitor) {
      monitor.addEventListener('downloadprogress', (event) => callbacks.onDownloadProgress(event.loaded));
    }
  }).catch((error) => {
    baseSessionPromise = undefined;
    throw error;
  });
  return baseSessionPromise;
}

async function createTaskSession(
  baseSession: LanguageModelSession,
  signal: AbortSignal
): Promise<{ session: LanguageModelSession; ownsSession: boolean }> {
  if (baseSession.clone) {
    try {
      const clonedSession = await baseSession.clone();
      if (clonedSession !== baseSession) {
        return { session: clonedSession, ownsSession: true };
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && signal.aborted) {
        throw error;
      }
    }
  }

  if (typeof LanguageModel === 'undefined' || !LanguageModel) {
    throw new Error('LANGUAGE_MODEL_UNAVAILABLE');
  }
  return {
    session: await LanguageModel.create({
      ...modelCapabilities,
      signal,
      initialPrompts: [{ role: 'system', content: SYSTEM_PROMPT }]
    }),
    ownsSession: true
  };
}

export async function disposeAnalysisSession(): Promise<void> {
  const session = await baseSessionPromise?.catch(() => undefined);
  session?.destroy();
  baseSessionPromise = undefined;
  cachedLanguageModelAvailability = undefined;
}

export async function analyzeImage(
  request: AnalyzeImageRequest,
  signal: AbortSignal,
  callbacks: AnalysisCallbacks
): Promise<AnalysisOutput> {
  if (typeof LanguageModel === 'undefined' || !LanguageModel) {
    throw new Error('LANGUAGE_MODEL_UNAVAILABLE');
  }

  const baseSession = await getBaseSession(callbacks);
  const taskSession = await createTaskSession(baseSession, signal);
  const session = taskSession.session;

  let loadedImage: LoadedImage | undefined;
  try {
    callbacks.onState('IMAGE_LOADING');
    loadedImage = await loadImage(request.image ?? {}, signal);
    callbacks.onState('ANALYZING');
    const response = await promptWithCompatibilityFallback(
      session,
      promptInput(buildAnalysisPrompt(request.context), loadedImage),
      signal
    );
    const parsed: unknown = parseModelJson(response);
    if (!isProductImageAnalysis(parsed)) throw new Error('INVALID_MODEL_RESPONSE');

    const translatorAvailability = await getTranslatorAvailability();
    if (translatorAvailability === 'unavailable') {
      return {
        result: parsed,
        language: 'en',
        translationWarning: '中文翻译暂时不可用，以下显示英文视觉描述。'
      };
    }

    callbacks.onState('TRANSLATING');
    try {
      return {
        result: await translateAnalysis(parsed, signal, callbacks.onDownloadProgress),
        language: 'zh'
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && signal.aborted) throw error;
      return {
        result: parsed,
        language: 'en',
        translationWarning: '中文翻译暂时不可用，以下显示英文视觉描述。'
      };
    }
  } finally {
    if (taskSession.ownsSession) session.destroy();
  }
}
