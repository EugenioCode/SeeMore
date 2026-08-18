<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { AnalyzeImageRequest, RuntimeResponse } from '../shared/messages';

const request = ref<AnalyzeImageRequest>();
const status = ref('等待选择商品图片');
const isLoading = ref(false);

function receiveRequest(response: RuntimeResponse): void {
  request.value = response.request;
  status.value = response.error ?? (response.request ? '已准备分析任务' : '请从商品图片右键打开 SeeMore');
}

function loadPendingRequest(): void {
  isLoading.value = true;
  chrome.runtime.sendMessage({ type: 'GET_PENDING_REQUEST' }, (response: RuntimeResponse) => {
    if (chrome.runtime.lastError || !response?.request) {
      chrome.runtime.sendMessage({ type: 'REQUEST_CURRENT_PAGE' }, (currentResponse: RuntimeResponse) => {
        if (chrome.runtime.lastError) {
          status.value = '当前页面无法访问，请从商品图片右键打开。';
        } else {
          receiveRequest(currentResponse);
        }
        isLoading.value = false;
      });
      return;
    }
    receiveRequest(response);
    isLoading.value = false;
  });
}

onMounted(loadPendingRequest);
</script>

<template>
  <main class="panel" aria-labelledby="page-title">
    <header class="panel-header">
      <h1 id="page-title">SeeMore</h1>
      <p>Making visual details accessible.</p>
    </header>

    <section aria-labelledby="status-title" class="section">
      <h2 id="status-title">当前状态</h2>
      <p role="status" aria-live="polite">{{ isLoading ? '正在读取当前页面…' : status }}</p>
    </section>

    <section v-if="request" aria-labelledby="context-title" class="section">
      <h2 id="context-title">商品上下文</h2>
      <dl class="context-list">
        <div v-if="request.context?.title">
          <dt>商品</dt>
          <dd>{{ request.context.title }}</dd>
        </div>
        <div v-if="request.context?.color">
          <dt>颜色</dt>
          <dd>{{ request.context.color }}</dd>
        </div>
        <div v-if="request.context?.material">
          <dt>材质</dt>
          <dd>{{ request.context.material }}</dd>
        </div>
      </dl>
      <p class="placeholder">AI 分析模块将在下一阶段接入。</p>
    </section>

    <button type="button" class="secondary-button" @click="loadPendingRequest">
      重新读取当前页面
    </button>
  </main>
</template>
