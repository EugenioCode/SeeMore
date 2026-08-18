export type TriggerSource = 'context-menu' | 'toolbar' | 'shortcut';

export type AnalysisState =
  | 'IDLE'
  | 'PREPARING_MODEL'
  | 'DOWNLOADING_MODEL'
  | 'IMAGE_LOADING'
  | 'ANALYZING'
  | 'TRANSLATING'
  | 'SUCCESS'
  | 'UNSUPPORTED'
  | 'ERROR'
  | 'CANCELLED';

export interface ImageReference {
  srcUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductContext {
  title?: string;
  price?: string;
  color?: string;
  material?: string;
  description?: string;
  sku?: string;
  imageAlt?: string;
  structuredData?: Record<string, unknown>;
}

export interface AnalyzeImageRequest {
  tabId: number;
  trigger: TriggerSource;
  image?: ImageReference;
  context?: ProductContext;
}

export type RuntimeMessage =
  | { type: 'GET_PENDING_REQUEST' }
  | { type: 'REQUEST_CURRENT_PAGE' }
  | { type: 'COLLECT_PAGE_CONTEXT'; image?: ImageReference }
  | { type: 'PAGE_CONTEXT_READY'; context: ProductContext };

export interface RuntimeResponse {
  request?: AnalyzeImageRequest;
  context?: ProductContext;
  error?: string;
}
