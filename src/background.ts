import browser from 'webextension-polyfill';

import { fetchBlackList } from '@/api';
import { DATA_HUB_EXTENSION_LINK } from '@/constant';
import { fmtError } from '@/utils';
import { ExternalMessageType, MessageType } from '@/utils/messageEvent';

const OFFSCREEN_DOCUMENT_PATH = '/src/offscreen.html';

async function hasOffscreenDocument(path: string) {
  if ('getContexts' in chrome.runtime) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [path],
    });
    return Boolean(contexts.length);
  } else {
    const matchedClients = await clients.matchAll();
    return matchedClients.some((client) =>
      client.url.includes(chrome.runtime.id),
    );
  }
}

let creating: Promise<void> | null = null;
async function setupOffscreenDocument(path: string) {
  try {
    const offscreenUrl = chrome.runtime.getURL(path);
    if (await hasOffscreenDocument(offscreenUrl)) {
      return;
    }

    if (creating) {
      await creating;
    } else {
      creating = chrome.offscreen.createDocument({
        url: path,
        reasons: [chrome.offscreen.Reason.WORKERS],
        justification: 'This document is use to issue random airdrop points',
      });
      await creating;
      creating = null;
    }
  } catch (error) {
    console.log('setupOffscreen error', error);
  }
}

const onMessageCallback: Parameters<
  typeof browser.runtime.onMessage.addListener
>[0] = async (message, sender, sendResponse) => {
  const request = message as ExternalMessageType;
  switch (request.type) {
    case 'auth': {
      if (sender.tab?.url === DATA_HUB_EXTENSION_LINK) {
        const { access, refresh } = request.data ?? {};

        try {
          await browser.storage.local.set({ access, refresh });
          sendResponse({ code: 200, data: true });
          return { code: 200, data: true };
        } catch (error) {
          sendResponse({ code: 400, msg: fmtError(error) });
          return { code: 400, msg: fmtError(error) };
        }
      }
      break;
    }
    case 'open offscreen': {
      if (sender.id === chrome.runtime.id) {
        const { access } = await chrome.storage.local.get('access');
        if (access) {
          await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
          void chrome.runtime.sendMessage<MessageType>({
            type: 'stepup',
            target: 'offscreen',
            data: { access: access as string },
          });
        }
      }
      break;
    }
    case 'open popup': {
      try {
        await chrome.action.openPopup();
        sendResponse({ code: 200, data: true });
        return { code: 200, data: true };
      } catch (error) {
        sendResponse({ code: 400, msg: fmtError(error) });
        return { code: 400, msg: fmtError(error) };
      }
    }
    case 'refresh_x_blacklist': {
      try {
        const { blacklist = [] } = await fetchBlackList();
        await browser.storage.local.set({
          x_blacklist: blacklist.map((v) => v.trim().toLowerCase()),
        });
        sendResponse({ code: 200, data: true });
        return { code: 200, data: true };
      } catch (error) {
        sendResponse({ code: 400, msg: fmtError(error) });
        return { code: 400, msg: fmtError(error) };
      }
    }
    default:
  }
};

browser.runtime.onMessage.addListener(onMessageCallback);
browser.runtime.onMessageExternal.addListener(onMessageCallback);
