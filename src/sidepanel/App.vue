<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { analyzeImage, disposeAnalysisSession } from '../ai/image-analyzer';
import type {
  AnalysisState,
  AnalyzeImageRequest,
  ProductImageAnalysis,
  RuntimeMessage,
  RuntimeResponse
} from '../shared/messages';

const request = ref<AnalyzeImageRequest>();
const result = ref<ProductImageAnalysis>();
const resultLanguage = ref<'zh' | 'en'>('zh');
const state = ref<AnalysisState>('IDLE');
type LocalAiStatus = 'available' | 'unavailable' | 'downloading';
const localAiStatus = ref<LocalAiStatus>(
  typeof LanguageModel === 'undefined' || !LanguageModel ? 'unavailable' : 'available'
);
const status = ref('等待选择商品图片');
const errorMessage = ref('');
const errorDiagnostic = ref('');
const translationWarning = ref('');
const downloadProgress = ref(0);
const pageTitle = ref<HTMLElement>();
let controller: AbortController | undefined;
let isUnmounted = false;

const isBusy = computed(() => [
  'PREPARING_MODEL', 'DOWNLOADING_MODEL', 'IMAGE_LOADING', 'ANALYZING', 'TRANSLATING'
].includes(state.value));

const progressSteps = ['获取图片', '本地分析', '生成描述'];

const activeStepIndex = computed(() => {
  if (['PREPARING_MODEL', 'DOWNLOADING_MODEL', 'IMAGE_LOADING'].includes(state.value)) return 0;
  if (state.value === 'ANALYZING') return 1;
  if (['TRANSLATING', 'SUCCESS'].includes(state.value)) return 2;
  return -1;
});

const localAiStatusLabel = computed(() => {
  if (localAiStatus.value === 'downloading') return '本地 AI 下载中';
  if (localAiStatus.value === 'unavailable') return '本地 AI 不可用';
  return '本地 AI 可用';
});

function isStepComplete(index: number): boolean {
  return state.value === 'SUCCESS' || index < activeStepIndex.value;
}

function updateState(nextState: AnalysisState): void {
  state.value = nextState;
  if (['PREPARING_MODEL', 'DOWNLOADING_MODEL'].includes(nextState)) {
    localAiStatus.value = 'downloading';
  } else if (nextState === 'UNSUPPORTED') {
    localAiStatus.value = 'unavailable';
  } else if (['IDLE', 'IMAGE_LOADING', 'ANALYZING', 'TRANSLATING', 'SUCCESS', 'CANCELLED'].includes(nextState)) {
    localAiStatus.value = 'available';
  }
  const messages: Record<AnalysisState, string> = {
    IDLE: '等待选择商品图片',
    PREPARING_MODEL: '正在准备本地 AI 模型（首次使用）…',
    DOWNLOADING_MODEL: '正在准备本地 AI 模型…',
    IMAGE_LOADING: '正在读取商品图片…',
    ANALYZING: '正在分析图片…',
    TRANSLATING: '正在生成中文描述…',
    SUCCESS: '分析完成',
    UNSUPPORTED: '当前设备暂时无法运行 Chrome 内置 AI。',
    ERROR: '图片分析没有成功。',
    CANCELLED: '已取消分析。'
  };
  status.value = messages[nextState];
}

function friendlyError(error: unknown): string {
  const message = error instanceof DOMException || error instanceof Error ? error.message : '';
  const name = error instanceof DOMException || error instanceof Error ? error.name : '';
  if (message === 'IMAGE_MISSING') return '没有找到可分析的商品图片，请从商品图片右键打开 SeeMore。';
  if (message === 'IMAGE_LOAD_FAILED' || message === 'IMAGE_TIMEOUT') {
    return 'SeeMore 无法读取这张图片，请尝试选择其他图片。';
  }
  if (message === 'IMAGE_CAPTURE_FAILED' || name === 'SecurityError') {
    return 'Chrome 无法安全读取这张跨域图片，请保持图片在当前视口中并重新读取页面。';
  }
  if (message === 'LANGUAGE_MODEL_UNAVAILABLE') {
    return '当前设备暂时无法运行 Chrome 内置 AI。请确认使用 Chrome 148 或更高版本，并满足内置 AI 的设备要求。';
  }
  if (message === 'INVALID_MODEL_RESPONSE') return 'AI 返回的描述格式无效，请重新尝试。';
  if (name === 'NotSupportedError' || name === 'InvalidStateError') {
    return '当前 Chrome 不接受这张图片的 AI 输入格式，请重新加载扩展后再试。';
  }
  if (name === 'QuotaExceededError') return '本地 AI 模型资源不足，请关闭其他标签页后重试。';
  return '图片分析没有成功，可以重新尝试。';
}

function diagnosticText(error: unknown, failedState: AnalysisState): string {
  if (error instanceof DOMException) return `${failedState} / ${error.name}：${error.message}`;
  if (!(error instanceof Error)) return `${failedState} / ${String(error)}`;
  const detail = error.message && error.message !== error.name ? `：${error.message}` : '';
  return `${failedState} / ${error.name}${detail}`;
}

async function startAnalysis(): Promise<void> {
  if (!request.value || isBusy.value) return;
  const analysisRequestId = request.value.requestId;
  if (!request.value.image?.srcUrl) {
    updateState('ERROR');
    errorMessage.value = friendlyError(new Error('IMAGE_MISSING'));
    return;
  }
  controller?.abort();
  controller = new AbortController();
  result.value = undefined;
  errorMessage.value = '';
  errorDiagnostic.value = '';
  translationWarning.value = '';
  downloadProgress.value = 0;
  try {
    const output = await analyzeImage(request.value, controller.signal, {
      onState(nextState) {
        if (request.value?.requestId === analysisRequestId) updateState(nextState);
      },
      onDownloadProgress(progress) {
        if (request.value?.requestId === analysisRequestId) {
          downloadProgress.value = Math.max(0, Math.min(100, Math.round(progress * 100)));
        }
      }
    });
    if (request.value?.requestId !== analysisRequestId) return;
    result.value = output.result;
    resultLanguage.value = output.language;
    translationWarning.value = output.translationWarning ?? '';
    updateState('SUCCESS');
  } catch (error) {
    if (isUnmounted) return;
    if (request.value?.requestId !== analysisRequestId) return;
    if (error instanceof DOMException && error.name === 'AbortError') {
      updateState('CANCELLED');
      return;
    }
    const failedState = state.value;
    updateState('ERROR');
    if (
      (error instanceof Error && error.message === 'LANGUAGE_MODEL_UNAVAILABLE')
      || failedState === 'PREPARING_MODEL'
      || failedState === 'DOWNLOADING_MODEL'
    ) {
      localAiStatus.value = 'unavailable';
    }
    errorMessage.value = friendlyError(error);
    errorDiagnostic.value = diagnosticText(error, failedState);
    console.error('[SeeMore] image analysis failed', formatError(error));
  }
}

function formatError(error: unknown): string {
  if (error instanceof DOMException) return `${error.name}: ${error.message}`;
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function cancelAnalysis(): void {
  controller?.abort();
}

function receiveRequest(response: RuntimeResponse, shouldAnalyze = true): void {
  if (!response.request) {
    errorMessage.value = response.error ?? '请从商品图片右键打开 SeeMore。';
    updateState('ERROR');
    return;
  }
  if (response.request.ready === false) {
    if (request.value?.requestId !== response.request.requestId) controller?.abort();
    request.value = response.request;
    result.value = undefined;
    errorMessage.value = '';
    errorDiagnostic.value = '';
    translationWarning.value = '';
    downloadProgress.value = 0;
    updateState('IDLE');
    status.value = '正在准备所选图片…';
    return;
  }
  const currentImage = request.value?.image;
  const nextImage = response.request.image;
  const isSameRequest = request.value?.requestId === response.request.requestId
    && request.value?.tabId === response.request.tabId
    && currentImage?.srcUrl === nextImage?.srcUrl
    && currentImage?.analysisDataUrl === nextImage?.analysisDataUrl;
  if (isSameRequest && isBusy.value) return;

  request.value = response.request;
  updateState('IDLE');
  status.value = '已找到商品图片，准备分析。';
  if (shouldAnalyze) void startAnalysis();
}

function loadPendingRequest(): void {
  controller?.abort();
  result.value = undefined;
  errorMessage.value = '';
  errorDiagnostic.value = '';
  state.value = 'IDLE';
  status.value = '正在读取当前页面…';
  chrome.runtime.sendMessage({ type: 'GET_PENDING_REQUEST' }, (response: RuntimeResponse) => {
    if (!chrome.runtime.lastError && response?.request) {
      receiveRequest(response);
      return;
    }
    chrome.runtime.sendMessage({ type: 'REQUEST_CURRENT_PAGE' }, (currentResponse: RuntimeResponse) => {
      if (chrome.runtime.lastError) {
        receiveRequest({ error: '当前页面无法访问，请从商品图片右键打开。' }, false);
      } else {
        receiveRequest(currentResponse);
      }
    });
  });
}

function handleRuntimeMessage(message: RuntimeMessage): false {
  if (message.type === 'ANALYSIS_REQUEST_READY') receiveRequest({ request: message.request });
  return false;
}

onMounted(() => {
  isUnmounted = false;
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  loadPendingRequest();
  void nextTick(() => pageTitle.value?.focus());
});

onBeforeUnmount(() => {
  isUnmounted = true;
  controller?.abort();
  void disposeAnalysisSession();
  chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
});
</script>

<template>
  <main class="panel" aria-labelledby="status-title">
    <section class="status-card" :data-state="state" aria-labelledby="status-title">
      <div class="status-heading">
        <div>
          <h2 id="status-title" ref="pageTitle" tabindex="-1">当前任务</h2>
        </div>
        <span class="ai-status" :class="`is-${localAiStatus}`">
          <span class="ai-status-dot" aria-hidden="true"></span>
          <span>{{ localAiStatusLabel }}</span>
        </span>
      </div>

      <p class="status-copy" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>

      <ol v-if="request" class="progress-rail" aria-label="分析流程">
        <li
          v-for="(step, index) in progressSteps"
          :key="step"
          :class="{
            'is-active': index === activeStepIndex,
            'is-complete': isStepComplete(index)
          }"
          :aria-current="index === activeStepIndex && state !== 'SUCCESS' ? 'step' : undefined"
        >
          <span class="step-marker" aria-hidden="true">{{ isStepComplete(index) ? '✓' : index + 1 }}</span>
          <span>{{ step }}</span>
        </li>
      </ol>

      <div v-if="state === 'DOWNLOADING_MODEL'" class="progress-group">
        <progress :value="downloadProgress" max="100">{{ downloadProgress }}%</progress>
        <span>首次准备 {{ downloadProgress }}%，完成后可重复使用。</span>
      </div>

      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
      <details v-if="errorDiagnostic" class="diagnostic">
        <summary>查看诊断信息</summary>
        <code>{{ errorDiagnostic }}</code>
      </details>

      <div class="actions">
        <button v-if="isBusy" type="button" class="secondary-button" @click="cancelAnalysis">取消当前分析</button>
        <button v-else-if="request?.ready === false" type="button" class="secondary-button" disabled>
          正在准备图片…
        </button>
        <button v-else-if="request" type="button" class="primary-button" @click="startAnalysis">
          {{ state === 'SUCCESS' ? '重新分析这张图' : '开始分析' }}
        </button>
        <button type="button" class="text-button" :disabled="isBusy" @click="loadPendingRequest">重新读取页面</button>
      </div>
    </section>

    <section v-if="!request" class="empty-state" aria-labelledby="empty-title">
      <span class="empty-index" aria-hidden="true">01</span>
      <h2 id="empty-title">选择一张商品图片</h2>
      <p>在购物页面右键点击图片，然后选择“使用 SeeMore 描述图片”。</p>
    </section>

    <section v-else-if="request.image" aria-labelledby="image-title" class="product-card">
      <div class="section-heading">
        <div>
          <h2 id="image-title">当前商品图片</h2>
        </div>
        <span class="section-number" aria-hidden="true">01</span>
      </div>
      <figure class="image-figure">
        <div class="image-frame">
          <img :src="request.image.srcUrl" :alt="request.image.alt || '待分析的商品图片'">
        </div>
        <figcaption v-if="request.context?.title">{{ request.context.title }}</figcaption>
      </figure>
    </section>

    <article v-if="result" class="results" :lang="resultLanguage" aria-labelledby="description-title">
      <p v-if="translationWarning" class="warning-message" role="status">{{ translationWarning }}</p>
      <section class="result-card">
        <div class="section-heading result-heading">
          <div>
            <h2 id="description-title">商品视觉描述</h2>
          </div>
          <span class="section-number" aria-hidden="true">02</span>
        </div>
        <p class="description-copy">{{ result.description }}</p>
        <p class="result-note">描述仅基于当前图片和页面可见信息，无法确认的内容不会作为事实呈现。</p>
      </section>
    </article>

    <footer class="privacy-note">
      <span aria-hidden="true">◆</span>
      <span>图片在浏览器本地处理，不会上传到远程服务器。</span>
    </footer>
  </main>
</template>
