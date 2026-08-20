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
  analysisDataUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  viewportX?: number;
  viewportY?: number;
  renderedWidth?: number;
  renderedHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface ProductImageAnalysis {
  description: string;
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
  requestId: string;
  tabId: number;
  trigger: TriggerSource;
  ready?: boolean;
  image?: ImageReference;
  context?: ProductContext;
}

export type RuntimeMessage =
  | { type: 'GET_PENDING_REQUEST' }
  | { type: 'REQUEST_CURRENT_PAGE' }
  | { type: 'COLLECT_PAGE_CONTEXT'; image?: ImageReference }
  | { type: 'ANALYSIS_REQUEST_READY'; request: AnalyzeImageRequest };

export interface RuntimeResponse {
  request?: AnalyzeImageRequest;
  context?: ProductContext;
  image?: ImageReference;
  error?: string;
}
