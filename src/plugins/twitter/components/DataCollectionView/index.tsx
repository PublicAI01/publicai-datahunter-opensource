import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCollectionTweet, TweetData as TweetDataType } from '@/api';
import CollectionData from '@/assets/collection-data.svg?react';
import ConnectAccount from '@/assets/connect-account.svg?react';
import DataCollectionSuccess from '@/assets/data-collection-success.svg?react';
import Failed from '@/assets/failed.svg?react';
import Loading from '@/assets/loading.svg?react';
import {
  DATA_HUB_EXTENSION_LINK,
  DATA_HUB_HOME_LINK,
  DATA_HUB_REWARD_LINK,
} from '@/constant';
import style from '@/plugins/twitter/components/DataCollectionView/style.css?inline';
import { fmtError, openLink } from '@/utils';
import { useColorScheme } from '@/utils/colorScheme';

type TweetData = {
  user?: { avatar?: string; username?: string; screen_name?: string };
  tweet?: { id?: string; content?: string; timestamp?: number };
};

type TweetWithElement = TweetData & { tweetEl?: HTMLElement };

const NOT_FOUND = 'not found';

/**
 * @deprecated hidden when version 2.
 */
export default function DataCollectionView({
  hasAccount,
}: {
  hasAccount: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TweetDataType>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();
  const colorScheme = useColorScheme();

  const fetchData = () => {
    const data: TweetWithElement = {};

    const mo = new MutationObserver(() => {
      const positionEl = document.querySelector('[role="progressbar"]');
      const tweetRootEl = positionEl
        ?.closest('div > [data-testid="inline_reply_offscreen"]')
        ?.parentElement?.querySelector('article[data-testid="tweet"]');
      if (!tweetRootEl) return;

      const a = tweetRootEl.querySelector<HTMLImageElement>(
        '[data-testid="Tweet-User-Avatar"] a img',
      );

      data.user = { ...data.user, avatar: a?.src };

      const u = tweetRootEl.querySelector<HTMLElement>(
        '[data-testid="User-Name"]',
      );

      if (u) {
        const [username, screenName] = u.innerText.split('\n');
        const screen_name = screenName.replace(/^@/, '');
        data.user = { ...data.user, username, screen_name };
      }

      const t = tweetRootEl.querySelector<HTMLElement>(
        '[data-testid="tweetText"]',
      );

      data.tweetEl = t ?? undefined;

      const d = tweetRootEl.querySelector<HTMLTimeElement>('time');

      if (d) {
        data.tweet = {
          timestamp: Math.floor(new Date(d.dateTime).getTime() / 1000),
        };
      }
    });

    mo.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    let count = 0;

    return new Promise<TweetData>((resolve, reject) => {
      const interval = setInterval(() => {
        const { tweetEl, ...remaining } = data;
        if (remaining.user?.screen_name && tweetEl) {
          clearInterval(interval);
          mo.disconnect();
          let content = '';
          for (const el of tweetEl.children) {
            const tagName = el.tagName.toLocaleLowerCase();

            switch (tagName) {
              case 'img': {
                const img = el as HTMLImageElement;

                if (!img.draggable && img.alt && img.src.includes('emoji')) {
                  content += img.alt;
                }
                break;
              }

              case 'span': {
                const span = el as HTMLSpanElement;
                content += span.innerText;
                break;
              }
              case 'div': {
                const div = el as HTMLDivElement;
                content += div.innerText;
                break;
              }
              case 'a': {
                const a = el as HTMLElement;
                content += a.innerText.replace(/…$/, '');
                break;
              }
              default:
                break;
            }
          }
          const id = tweetEl.baseURI.match(/\/status\/(.*?)$/)?.at(1);
          resolve({
            ...remaining,
            tweet: { ...(remaining.tweet ?? {}), id, content },
          });
        }

        if (count >= 20) {
          clearInterval(interval);
          mo.disconnect();

          if (tweetEl) {
            reject(new Error('timeout'));
          } else {
            reject(new Error('This tweet does not contain text information'));
          }
        }

        count++;
      }, 500);
    });
  };

  const _fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      if (
        data.tweet?.id &&
        data.tweet.content &&
        data.user?.screen_name &&
        data.user.avatar
      ) {
        setData({
          author_name: data.user.screen_name,
          author_image: data.user.avatar,
          tweet: data.tweet.content,
          tweet_id: data.tweet.id,
          timestamp: data.tweet.timestamp,
        });
        if (error === NOT_FOUND) {
          setError(undefined);
        }
      } else {
        setError(NOT_FOUND);
      }
    } catch (error) {
      setError(fmtError(error));
    } finally {
      setLoading(false);
    }
  }, [error]);

  const onCollection = useCallback(async () => {
    if (!data) {
      setError(
        'The current page data is abnormal, please refresh and try again',
      );
      return;
    }
    setLoading(true);
    try {
      await fetchCollectionTweet(data);
      setSuccess(true);
      setError(undefined);
    } catch (error) {
      setError(fmtError(error));
    } finally {
      setLoading(false);
    }
  }, [data]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <>
          <Loading className="loading" />
          <p>
            {data
              ? 'PublicAl Data Hunter is adding this tweet to the verification dataset..'
              : 'Tweet data is being collected and analyzed..'}
          </p>
          <button onClick={() => openLink(DATA_HUB_HOME_LINK)}>
            Go to Data Hub
          </button>
        </>
      );
    }

    if (error) {
      return (
        <>
          <Failed />
          <p>{error}</p>
          <button
            onClick={() => {
              if (error === NOT_FOUND) {
                void _fetchData();
              } else {
                void onCollection();
              }
            }}>
            Retry
          </button>
        </>
      );
    }

    if (success) {
      return (
        <>
          <DataCollectionSuccess />
          <p>This tweet has been added to the verification data hub.</p>
          <button
            onClick={() => {
              openLink(DATA_HUB_REWARD_LINK);
            }}>
            Check Status
          </button>
        </>
      );
    }

    if (hasAccount) {
      return (
        <>
          <CollectionData
            style={{ cursor: 'pointer' }}
            onClick={() => {
              void onCollection();
            }}
          />
          <p>Click + button to add this tweet to Data Hub for Al training.</p>
          <button onClick={() => openLink(DATA_HUB_HOME_LINK)}>
            Go to Data Hub
          </button>
        </>
      );
    }

    return (
      <>
        <ConnectAccount />
        <p>Connect to PublicAI Account to collect tweet data.</p>
        <button onClick={() => openLink(DATA_HUB_EXTENSION_LINK)}>
          Bind PublicAI Account
        </button>
      </>
    );
  }, [loading, error, success, hasAccount, data, _fetchData, onCollection]);

  useEffect(() => {
    void _fetchData();
  }, [_fetchData]);

  return (
    <>
      <style>{style}</style>
      <div
        className="container"
        style={{ colorScheme }}
        data-color-scheme={colorScheme}>
        {content}
      </div>
    </>
  );
}
