interface AIModelProgressEvent extends Event {
  loaded: number;
}

interface AIModelMonitor extends EventTarget {
  addEventListener(
    type: 'downloadprogress',
    listener: (event: AIModelProgressEvent) => void
  ): void;
}

type AIAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

interface LanguageModelPromptContent {
  type: 'text' | 'image';
  value: string | HTMLImageElement | ImageBitmap | Blob | ImageData;
}

interface LanguageModelPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string | LanguageModelPromptContent[];
}

interface LanguageModelSession {
  prompt(
    input: string | LanguageModelPrompt[],
    options?: {
      responseConstraint?: Record<string, unknown>;
      omitResponseConstraintInput?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<string>;
  clone?(): Promise<LanguageModelSession>;
  destroy(): void;
}

interface LanguageModelOptions {
  expectedInputs?: Array<{ type: 'text' | 'image'; languages?: string[] }>;
  expectedOutputs?: Array<{ type: 'text'; languages?: string[] }>;
  initialPrompts?: LanguageModelPrompt[];
  monitor?: (monitor: AIModelMonitor) => void;
  signal?: AbortSignal;
}

interface LanguageModelFactory {
  availability(options?: LanguageModelOptions): Promise<AIAvailability>;
  create(options?: LanguageModelOptions): Promise<LanguageModelSession>;
}

interface TranslatorSession {
  translate(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: AIModelMonitor) => void;
  signal?: AbortSignal;
}

interface TranslatorFactory {
  availability(options: TranslatorOptions): Promise<AIAvailability>;
  create(options: TranslatorOptions): Promise<TranslatorSession>;
}

declare const LanguageModel: LanguageModelFactory | undefined;
declare const Translator: TranslatorFactory | undefined;
