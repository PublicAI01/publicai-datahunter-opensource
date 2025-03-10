import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import tweetText from 'twitter-text';
import browser from 'webextension-polyfill';

import { fetchCheckReply, fetchGenerateXComments, GenerateResult } from '@/api';
import Close from '@/assets/close.svg?react';
import Logo from '@/assets/logo-black-small.svg?react';
import Retry from '@/assets/retry.svg?react';
import Loading from '@/components/Loading';
import { DATA_HUB_EXTENSION_LINK } from '@/constant';
import style from '@/plugins/twitter/components/GenerateCommentsWidget/style.css?inline';
import {
  getTweetContent,
  getTweetTime,
  getTweetUserName,
  type TweetData,
  type TweetDataWithId,
} from '@/plugins/twitter/utils';
import { fmtError, openLink, shortenError } from '@/utils';
import { useColorScheme } from '@/utils/colorScheme';
import { AppError } from '@/utils/http';
import { MessageType } from '@/utils/messageEvent';

type TweetWithRootElement = TweetData & { rootEl?: Element; tweetEl?: Element };
type TweetWithIdAndRootElement = TweetDataWithId & {
  rootEl?: Element;
  tweetEl?: Element;
  replyRootEl?: Element;
};
type TweetWithTextAreaElement = TweetData & {
  textareaEl: HTMLDivElement;
  submitEl: HTMLButtonElement;
};

const RECONNECT_FLAG = 'RECONNECT_FLAG';

export default function GenerateCommentsWidget({
  currentRef,
  hasAccount,
}: {
  currentRef: HTMLElement;
  hasAccount: boolean;
}) {
  const [hasAccess, setHasAccess] = useState(hasAccount);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TweetWithTextAreaElement | null>(null);
  const dataRef = useRef<TweetWithTextAreaElement | null>(null);
  const [error, setError] = useState<string>();
  const colorScheme = useColorScheme();
  const [result, setResult] = useState<GenerateResult | null>(null);
  const resultRef = useRef<GenerateResult | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [isLimited, setIsLimited] = useState(false);

  const needReconnect = error === RECONNECT_FLAG;

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const refreshXBlackList = useCallback(() => {
    browser.runtime
      .sendMessage({
        type: 'refresh_x_blacklist',
        target: 'background',
      } as MessageType)
      .catch(() => {
        /** ignore */
      });
  }, []);

  useEffect(() => {
    refreshXBlackList();
  }, [refreshXBlackList]);

  function findTargetElement(list: NodeListOf<Element>, data: TweetData) {
    for (const el of list) {
      const user = getTweetUserName(el);
      const time = getTweetTime(el);
      if (
        user.username === data.user?.username &&
        user.screen_name === data.user?.screen_name &&
        time === data.tweet?.timestamp
      ) {
        return el;
      }
    }
    return null;
  }

  const fetchData = useCallback(() => {
    let result: TweetWithRootElement | TweetWithIdAndRootElement = {};
    const mo = new MutationObserver(() => {
      let ancestorDiv = currentRef.closest('div');
      while (ancestorDiv) {
        if (ancestorDiv.querySelector('[role="progressbar"]')) {
          break;
        }
        ancestorDiv = ancestorDiv.parentElement?.closest('div') ?? null;
      }

      if (ancestorDiv) {
        const id = currentRef.baseURI.match(/status\/(\d+)/)?.at(1);

        if (id) {
          console.log('id case');

          const data: TweetWithIdAndRootElement = { tweet: { id } };

          const positionEl = document.querySelector('[role="progressbar"]');
          const tweetRootEl = positionEl
            ?.closest('div > [data-testid="inline_reply_offscreen"]')
            ?.parentElement?.querySelector('article[data-testid="tweet"]');
          if (!tweetRootEl) return;

          const user = getTweetUserName(tweetRootEl);

          data.user = { ...data.user, ...user };

          const time = getTweetTime(tweetRootEl);

          data.tweet = { ...data.tweet, timestamp: time };

          data.tweetEl =
            tweetRootEl.querySelector<HTMLElement>(
              '[data-testid="tweetText"]',
            ) ?? undefined;

          data.rootEl = tweetRootEl;

          data.replyRootEl = ancestorDiv;

          console.log('id case data', data);

          result = { ...data };
        } else {
          console.log('no id case');

          const data: TweetWithRootElement = {};

          const user = getTweetUserName(ancestorDiv);

          data.user = { ...data.user, ...user };

          const time = getTweetTime(ancestorDiv);

          data.tweet = { timestamp: time };

          data.rootEl = ancestorDiv;

          data.tweetEl =
            ancestorDiv.querySelector<HTMLElement>(
              '[data-testid="tweetText"]',
            ) ?? undefined;

          console.log('no id case data', data);

          result = { ...data };
        }
      }
    });

    mo.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    let count = 0;

    return new Promise<TweetWithTextAreaElement>((resolve, reject) => {
      const interval = setInterval(() => {
        console.log('count', count);

        const { rootEl, tweetEl, ...remaining } = result;
        if (rootEl && tweetEl && remaining.user?.screen_name) {
          clearInterval(interval);
          mo.disconnect();

          console.log('true case');

          const el = remaining.tweet?.id
            ? rootEl
            : findTargetElement(
                document.body.querySelectorAll('[data-testid="cellInnerDiv"]'),
                remaining,
              );
          const infoEl = el?.querySelector(
            '[data-testid="tweet"] [role="group"]',
          );
          const all_data = infoEl?.getAttribute('aria-label');
          const info: Record<string, string> = { all_data: all_data ?? '' };
          for (const node of infoEl?.children ?? []) {
            for (const e of node.children) {
              const label = e.getAttribute('aria-label');
              if (label) {
                const testid = e.getAttribute('data-testid');
                if (testid) {
                  info[testid] = label;
                }
                if (
                  e.tagName.toLocaleLowerCase() === 'a' &&
                  (e as HTMLAnchorElement).href.includes('analytics')
                ) {
                  const href = e.getAttribute('href');
                  if (href?.includes('analytics')) {
                    info['views'] = label;
                  }
                  const id = href?.match(/status\/(\d+)/)?.at(1);
                  if (id) {
                    info['id'] = id;
                  }
                }
              }
            }
          }
          const content = getTweetContent(tweetEl);
          let replyEl: Element | undefined = rootEl;
          if (remaining.tweet?.id) {
            replyEl = (result as TweetWithIdAndRootElement).replyRootEl;
          }
          const textareaEl = replyEl?.querySelector<HTMLDivElement>(
            '[contenteditable="true"]',
          );
          const submitEl = replyEl?.querySelector<HTMLButtonElement>(
            '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]',
          );

          if (textareaEl && submitEl) {
            resolve({
              ...remaining,
              tweet: {
                ...{ id: info['id'] },
                ...(remaining.tweet ?? {}),
                content,
                info,
              },
              textareaEl,
              submitEl,
            });
          } else {
            reject(new Error('abnormal environment'));
          }
        }

        if (count >= 20) {
          console.log('timeout case');

          clearInterval(interval);
          mo.disconnect();

          if (result.user?.screen_name) {
            reject(new Error('timeout'));
          } else {
            reject(new Error('This tweet does not contain text information'));
          }
        }
        count++;
      }, 500);
    });
  }, [currentRef]);

  const _fetchData = useCallback(async () => {
    console.log('_fetchData start');

    if (!hasAccess) return;

    setLoading(true);
    try {
      const data = await fetchData();
      const { result: available, msg } = await fetchCheckReply({
        content: data.tweet?.content,
        id: data.tweet?.id,
        info: data.tweet?.info,
        time: data.tweet?.timestamp,
      });
      const isLimited = available === false;
      setIsLimited(isLimited);
      setError(isLimited ? msg?.slice(0, 15) || 'failed' : undefined);
      setData(data);
    } catch (error) {
      console.log('_fetchData error', error);
      if (error instanceof AppError && error.code === 401) {
        setError(RECONNECT_FLAG);
      } else {
        setError(shortenError(error));
      }
    }
    setLoading(false);
  }, [fetchData, hasAccess]);

  useEffect(() => {
    _fetchData().catch(() => {
      /** ignore */
    });
  }, [_fetchData]);

  const setupOffscreen = useCallback(() => {
    browser.runtime
      .sendMessage(undefined, {
        type: 'open offscreen',
        target: 'background',
      } as MessageType)
      .catch(() => {
        /** ignore */
      });
  }, []);

  const onClick = useCallback(async () => {
    if (needReconnect) {
      openLink(DATA_HUB_EXTENSION_LINK);
      return;
    }
    if (!hasAccess) {
      setShowTips((show) => !show);
      return;
    }
    if (!data) {
      _fetchData().catch(() => {
        /** ignore */
      });
      return;
    }
    setupOffscreen();
    setLoading(true);
    try {
      console.log('data', data);
      console.log('data', data.textareaEl);
      const result = await fetchGenerateXComments({
        content: data.tweet?.content,
        id: data.tweet?.id,
        info: data.tweet?.info,
        time: data.tweet?.timestamp,
      });
      setResult(result);
      let promotion = result.promotion ?? '';
      const tweet = tweetText.parseTweet(promotion);
      if (!tweet.valid) {
        promotion = promotion.substring(0, tweet.validRangeEnd + 1);
      }
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', promotion);
      data.textareaEl.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: dataTransfer,
          bubbles: true,
          cancelable: true,
        }),
      );
      dataTransfer.clearData();
    } catch (error) {
      console.log('error', error);
      setError(fmtError(error));
    }
    setLoading(false);
  }, [_fetchData, data, hasAccess, needReconnect, setupOffscreen]);

  useEffect(() => {
    const callback: Parameters<
      typeof browser.storage.onChanged.addListener
    >[0] = (
      data: Record<string, browser.Storage.StorageChange | undefined>,
    ) => {
      const { access } = data;

      const hasAccess = Boolean(access?.newValue);
      setHasAccess(hasAccess);
      if (hasAccess) {
        setShowTips(false);
        _fetchData().catch(() => {
          /** ignore */
        });
      }
    };

    browser.storage.onChanged.addListener(callback);

    return () => {
      if (browser.storage.onChanged.hasListener(callback)) {
        browser.storage.onChanged.removeListener(callback);
      }
    };
  }, [_fetchData]);

  const status = useMemo(() => {
    if (loading) return 'loading';
    if (error) return 'error';
    if (result) return 'success';
    return undefined;
  }, [error, loading, result]);

  return (
    <>
      <style>{style}</style>
      <div
        className="container"
        style={{ colorScheme }}
        data-color-scheme={colorScheme}>
        <div
          className="no-account-tips"
          style={{
            display: showTips ? undefined : 'none',
          }}>
          <div
            className="close"
            onClick={() => {
              setShowTips(false);
            }}>
            <Close />
          </div>
          <p>Connect to PublicAI Account to generate ai reply.</p>
          <button
            onClick={() => {
              openLink(DATA_HUB_EXTENSION_LINK);
            }}>
            <span>Connect to PublicAI</span>
          </button>
        </div>
        <button
          className={status}
          disabled={isLimited}
          onClick={() => {
            void onClick();
          }}>
          {loading ? (
            <Loading />
          ) : (
            <div>
              <Logo className="logo" />
              <span>
                {needReconnect ? 'Reconnect' : error ? error : 'AI Reply'}
              </span>
            </div>
          )}
          {!loading && !isLimited && !needReconnect && error && (
            <Retry className="retry" />
          )}
        </button>
      </div>
    </>
  );
}
