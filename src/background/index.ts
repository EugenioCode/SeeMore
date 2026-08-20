import { CONTEXT_MENU_ID } from '../shared/constants';
import type {
  AnalyzeImageRequest,
  ImageReference,
  ProductContext,
  RuntimeMessage,
  RuntimeResponse,
  TriggerSource
} from '../shared/messages';

const pendingRequests = new Map<number, AnalyzeImageRequest>();

function registerContextMenu(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: '使用 SeeMore 描述图片',
      contexts: ['image']
    });
  });
}

function openSidePanel(tabId: number): void {
  void chrome.sidePanel.open({ tabId }).catch(() => {
    // Restricted browser pages may reject Side Panel.open.
  });
}

async function injectContentScript(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  });
}

function sendToTab<T>(tabId: number, message: RuntimeMessage): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: T | undefined) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function collectContext(
  tabId: number,
  image?: ImageReference
): Promise<{ context?: ProductContext; image?: ImageReference }> {
  try {
    await injectContentScript(tabId);
    const response = await sendToTab<RuntimeResponse>(tabId, {
      type: 'COLLECT_PAGE_CONTEXT',
      image
    });
    return { context: response?.context, image: response?.image ?? image };
  } catch {
    return { image };
  }
}

async function attachVisibleCapture(
  tab: chrome.tabs.Tab,
  image?: ImageReference
): Promise<ImageReference | undefined> {
  if (!image || typeof tab.windowId !== 'number') return image;
  if (
    typeof image.viewportX !== 'number'
    || typeof image.viewportY !== 'number'
    || typeof image.renderedWidth !== 'number'
    || typeof image.renderedHeight !== 'number'
  ) return image;

  try {
    const analysisDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
    return { ...image, analysisDataUrl };
  } catch {
    return image;
  }
}

async function prepareRequest(
  tab: chrome.tabs.Tab,
  trigger: TriggerSource,
  image?: ImageReference
): Promise<AnalyzeImageRequest | undefined> {
  if (typeof tab.id !== 'number') return undefined;
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const pendingRequest: AnalyzeImageRequest = {
    requestId,
    tabId: tab.id,
    trigger,
    ready: false,
    image
  };
  pendingRequests.set(tab.id, pendingRequest);

  const pageData = await collectContext(tab.id, image);
  const capturedImage = await attachVisibleCapture(tab, pageData.image);
  const request: AnalyzeImageRequest = {
    requestId,
    tabId: tab.id,
    trigger,
    ready: true,
    image: capturedImage,
    context: pageData.context
  };
  if (pendingRequests.get(tab.id) !== pendingRequest) return pendingRequests.get(tab.id);
  pendingRequests.set(tab.id, request);
  void chrome.runtime.sendMessage({ type: 'ANALYSIS_REQUEST_READY', request }).catch(() => {
    // Side Panel may not be open yet.
  });
  return request;
}

async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0];
}

chrome.runtime.onInstalled.addListener(registerContextMenu);
registerContextMenu();

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id !== 'number') return;
  openSidePanel(tab.id);
  void prepareRequest(tab, 'toolbar');
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'open-seemore') return;
  void getActiveTab().then((tab) => {
    if (typeof tab?.id !== 'number') return;
    openSidePanel(tab.id);
    void prepareRequest(tab, 'shortcut');
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || typeof tab?.id !== 'number') return;
  const image: ImageReference = {
    srcUrl: info.srcUrl
  };
  openSidePanel(tab.id);
  void prepareRequest(tab, 'context-menu', image);
});

chrome.runtime.onMessage.addListener(
  (message: RuntimeMessage, _sender, sendResponse: (response: RuntimeResponse) => void) => {
  if (message.type === 'GET_PENDING_REQUEST') {
      void getActiveTab().then((tab) => {
        const request = typeof tab?.id === 'number' ? pendingRequests.get(tab.id) : undefined;
        sendResponse({ request });
      });
      return true;
    }

    if (message.type === 'REQUEST_CURRENT_PAGE') {
      void getActiveTab().then(async (tab) => {
        if (!tab) {
          sendResponse({ error: '当前页面无法访问。' });
          return;
        }
        const request = await prepareRequest(tab, 'toolbar');
        sendResponse({ request });
      });
      return true;
    }

    return false;
  }
);
