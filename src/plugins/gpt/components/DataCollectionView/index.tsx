import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchCollectionGPT, GPTData } from '@/api';
import Failed from '@/assets/failed-small.svg?react';
import Loading from '@/assets/loading-small.svg?react';
import Logo from '@/assets/logo-black-small.svg?react';
import OpenLink from '@/assets/open-link.svg?react';
import Refresh from '@/assets/refresh-small.svg?react';
import Success from '@/assets/success-small.svg?react';
import Upload from '@/assets/upload-small.svg?react';
import Coin from '@/components/Coin';
import { DATA_HUB_EXTENSION_LINK, DATA_HUB_REWARD_LINK } from '@/constant';
import absoluteStyle from '@/plugins/gpt/components/DataCollectionView/absolute.css?inline';
import style from '@/plugins/gpt/components/DataCollectionView/style.css?inline';
import { fmtError, openLink } from '@/utils';
import { useColorScheme } from '@/utils/colorScheme';

const NOT_FOUND = 'not found';

/**
 * @deprecated hidden when version 2.
 */
export default function DataCollectionView({
  needAbsolute,
  hasAccount,
  id,
  unmount,
}: {
  needAbsolute: boolean;
  hasAccount: boolean;
  id: string;
  unmount: () => void;
}) {
  const [pageInfo, setPageInfo] = useState<{ count: number; title: string }>({
    count: 0,
    title: '',
  });
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [data, setData] = useState<GPTData>();
  const [success, setSuccess] = useState<{ reward: number }>();
  const [error, setError] = useState<string>();
  const errorRef = useRef<string>();
  const ref = useRef<HTMLDivElement>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const fetchData = () => {
    let count = 0;

    return new Promise<GPTData>((resolve, reject) => {
      const interval = setInterval(() => {
        const stopButton = document.querySelector<HTMLElement>(
          '[data-testid="stop-button"]',
        );

        if (stopButton) return;

        const conversations = document.querySelectorAll<HTMLElement>(
          '[data-message-author-role]',
        );

        if (conversations.length === 0) return;

        const list = [];

        for (const conversation of conversations) {
          const role = conversation.getAttribute('data-message-author-role');
          const id = conversation.getAttribute('data-message-id');
          const content = conversation.innerText;

          if (role && id) {
            list.push({
              id,
              role,
              content,
            });
          }
        }

        if (list.length > 0) {
          clearInterval(interval);

          const title = document.title;
          const id = document.location.pathname.replace(/^\/c\//, '');

          resolve({ id, title, list });
        }

        if (count >= 20) {
          clearInterval(interval);
          reject(new Error('timeout'));
        }

        count++;
      }, 300);
    });
  };

  const _fetchData = useCallback(async () => {
    setLoading1(true);
    try {
      const data = await fetchData();
      if (data.id) {
        setData(data);
        if (errorRef.current === NOT_FOUND) {
          setError(undefined);
        }
      } else {
        setError(NOT_FOUND);
      }
    } catch (error) {
      setError(fmtError(error));
    } finally {
      setLoading1(false);
    }
  }, []);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      const all = document.querySelectorAll<HTMLElement>(
        '[data-message-author-role]',
      );
      setPageInfo({ count: all.length, title: document.title });
    });

    mo.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (
      (pageInfo.count > 0 && data?.list.length !== pageInfo.count) ||
      data?.title !== pageInfo.title
    ) {
      void _fetchData();

      if (
        data?.list.length !== undefined &&
        data.list.length < pageInfo.count
      ) {
        setSuccess(undefined);
        setError(undefined);
      }
    }
  }, [
    _fetchData,
    data?.list.length,
    data?.title,
    pageInfo.count,
    pageInfo.title,
  ]);

  useEffect(() => {
    if (data?.id && data.id !== id) {
      unmount();
    }
  }, [data?.id, id, unmount]);

  const onCollection = useCallback(async () => {
    if (!data) {
      setError(
        'The current page data is abnormal, please refresh and try again',
      );
      return;
    }
    setLoading2(true);
    try {
      const _data = await fetchData();
      const { reward } = await fetchCollectionGPT(_data);
      setSuccess({ reward });
      setError(undefined);
    } catch (error) {
      setError(fmtError(error));
    } finally {
      setLoading2(false);
    }
  }, [data]);

  const content = useMemo(() => {
    if (loading2) {
      return (
        <button disabled>
          <Loading className="loading" />
          <p>{`Uploading "${data?.title ?? ''}" to Data Hub`}</p>
        </button>
      );
    }

    if (loading1) {
      return (
        <button disabled>
          <Loading className="loading" />
          <p>Chat data is being collected and analyzed..</p>
        </button>
      );
    }

    if (error) {
      return (
        <>
          <button disabled>
            <Failed />
            <p>You have already uploaded &quot;{data?.title}&quot;</p>
          </button>
          <button
            onClick={() => {
              if (error === NOT_FOUND) {
                void _fetchData();
              } else {
                void onCollection();
              }
            }}>
            <p>Retry</p>
            <Refresh className="icon" />
          </button>
        </>
      );
    }

    if (success) {
      return (
        <>
          <button disabled>
            <Success />
            <p>&quot;{data?.title}&quot; is uploaded, You&apos;ve earned</p>
            <Coin className="coin" />
            <p>{success.reward}</p>
          </button>
          <button
            onClick={() => {
              openLink(DATA_HUB_REWARD_LINK);
            }}>
            <p>Check Records</p>
            <OpenLink className="icon" />
          </button>
        </>
      );
    }

    if (hasAccount) {
      return (
        <button
          onClick={() => {
            void onCollection();
          }}>
          <Upload className="icon" />
          Upload Chat Data
        </button>
      );
    }

    return (
      <button
        onClick={() => {
          openLink(DATA_HUB_EXTENSION_LINK);
        }}>
        <Logo className="icon" />
        <p>Login PublicAI to collect data</p>
      </button>
    );
  }, [
    _fetchData,
    data?.title,
    error,
    hasAccount,
    loading1,
    loading2,
    onCollection,
    success,
  ]);

  return (
    <>
      <style>{style}</style>
      {needAbsolute && <style>{absoluteStyle}</style>}
      <div
        className="container"
        ref={ref}
        style={{ colorScheme }}
        data-color-scheme={colorScheme}>
        {content}
      </div>
    </>
  );
}
