import { useCallback, useEffect, useMemo, useState } from 'react';
import browser from 'webextension-polyfill';

import { fetchSelf, fetchSendEvent, UserInfo } from '@/api';
import Copy from '@/assets/copy.svg?react';
import Loading from '@/assets/loading.svg?react';
import Logo from '@/assets/logo.svg?react';
import Logout from '@/assets/logout.svg?react';
import PublicAI from '@/assets/publicai.svg?react';
import Refresh from '@/assets/refresh.svg?react';
import User from '@/assets/user.svg?react';
import { ArrowRight } from '@/components/Arrow';
import { Button } from '@/components/Button';
import Coin from '@/components/Coin';
import DataValidatedButton from '@/components/DataValidatedButton';
import { GridPattern } from '@/components/GridPattern';
import {
  DATA_HUB_DASHBOARD_LINK,
  DATA_HUB_EXTENSION_LINK,
  DATA_HUB_HOME_LINK,
  GIT_BOOK_LINK,
} from '@/constant';
import { useToast } from '@/hooks/toast';
import { ToastProvider } from '@/provider/toast';
import { cn, fmtNotificationError, openLink } from '@/utils';
import { MessageType } from '@/utils/messageEvent';

import '@/pages/Popup.css';

export default function Popup() {
  return (
    <ToastProvider>
      <Index />
    </ToastProvider>
  );
}

function Index() {
  const [noToken, setNoToken] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const { showToast } = useToast();

  const onCheckToken = useCallback(async () => {
    const { access } = await browser.storage.local.get('access');

    if (access) {
      void onFetchSelf();
      return;
    }
    setNoToken(false);
  }, []);

  useEffect(() => {
    void onCheckToken();
  }, [onCheckToken]);

  useEffect(() => {
    if (!noToken) return;

    const callback: Parameters<
      typeof browser.storage.onChanged.addListener
    >[0] = (
      data: Record<string, browser.Storage.StorageChange | undefined>,
    ) => {
      const { access } = data;
      if (access?.newValue) {
        void onFetchSelf();
        if (browser.storage.onChanged.hasListener(callback)) {
          browser.storage.onChanged.removeListener(callback);
        }
      }
    };

    browser.storage.onChanged.addListener(callback);

    return () => {
      if (browser.storage.onChanged.hasListener(callback)) {
        browser.storage.onChanged.removeListener(callback);
      }
    };
  }, [noToken]);

  const onFetchSelf = async (hideLoading = false) => {
    if (!hideLoading) {
      setLoading(true);
    }
    try {
      const data = await fetchSelf();
      setUserInfo(data);
    } catch (error) {
      const result = await browser.permissions.contains({
        permissions: ['notifications'],
      });
      if (result) {
        void browser.notifications.create(
          undefined,
          fmtNotificationError(error),
        );
      }
    } finally {
      if (!hideLoading) {
        setLoading(false);
      }
    }
  };

  const fetchEvent = async () => {
    try {
      await fetchSendEvent();
    } catch {
      /** ignore */
    }
  };

  const refreshXBlackList = () => {
    void browser.runtime.sendMessage({
      type: 'refresh_x_blacklist',
      target: 'background',
    } as MessageType);
  };

  useEffect(() => {
    void fetchEvent();
    refreshXBlackList();
  }, []);

  const setupOffscreen = useCallback(() => {
    void browser.runtime.sendMessage({
      type: 'open offscreen',
      target: 'background',
    } as MessageType);
  }, []);

  useEffect(() => {
    if (userInfo?.referral_code) {
      setupOffscreen();
    }
  }, [setupOffscreen, userInfo?.referral_code]);

  const onRefresh = useCallback(async () => {
    setupOffscreen();
    await onFetchSelf(true);
  }, [setupOffscreen]);

  const onConnect = async () => {
    await browser.permissions.request({
      permissions: ['notifications'],
    });

    openLink(DATA_HUB_EXTENSION_LINK);
  };

  const onLogout = async () => {
    await Promise.all([
      browser.storage.local.remove(['access', 'refresh']),
      chrome.offscreen.closeDocument(),
    ]);
    setUserInfo(undefined);
    setNoToken(true);
  };

  const onCopy = useCallback(async () => {
    await browser.permissions.request({
      permissions: ['clipboardWrite'],
    });

    await navigator.clipboard.writeText(
      `${DATA_HUB_HOME_LINK}${userInfo?.referral_code ? `?r=${userInfo.referral_code}` : ''}`,
    );

    showToast({ text: 'Copied!' });
  }, [showToast, userInfo?.referral_code]);

  const element = useMemo(() => {
    if (userInfo) {
      return (
        <div className="flex h-full flex-col items-center">
          <div className="flex w-full items-center justify-between px-8 pt-8">
            <div className="flex items-center gap-1.5">
              <Logo className="h-9 w-auto" />
              <PublicAI className="h-4 w-auto text-white" />
            </div>

            <div className="relative hover:[&>.logout]:block">
              <Button
                theme="pixel"
                className="bg-black-50 px-3.5">
                <User className="size-5" />
              </Button>
              <div className="logout absolute right-0 hidden pt-2">
                <Button
                  theme="pixel"
                  className="px-4"
                  bodyClassName="flex items-center gap-2"
                  onClick={onLogout}>
                  <p className="text-xs font-medium">Logout</p>
                  <Logout className="size-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col items-center justify-between pt-12">
            <div className="flex w-full flex-col items-center">
              <div className="mt-4 flex items-end justify-center gap-4">
                <Coin className="mb-3 h-auto w-6 text-purple-300" />
                <p className="font-pixel text-white-100 text-6xl font-medium tracking-wide">
                  {Intl.NumberFormat().format(userInfo.earnings ?? 0)}
                </p>
                <Button
                  theme="none"
                  onClick={onRefresh}>
                  {(pending) => (
                    <Refresh
                      className={cn(
                        'text-white-100 mb-3 size-6',
                        pending && 'animate-spin',
                      )}
                    />
                  )}
                </Button>
              </div>
              <DataValidatedButton
                className="cursor-default"
                value={userInfo.work}
              />
              <Button
                theme="none"
                className="bg-gold-300 mx-auto w-1/2 py-2 text-xl font-semibold text-[#0E0E11]"
                onClick={() => {
                  openLink(userInfo.earn_more_link ?? DATA_HUB_HOME_LINK);
                }}>
                Earn more
              </Button>
              <a
                href={GIT_BOOK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-medium text-purple-200 underline">
                How to use?
              </a>
            </div>

            <div className="flex w-3/4 flex-col items-center gap-5 pb-10">
              <Button
                theme="pixel"
                className="w-full border-purple-500 bg-purple-500 py-2 text-white"
                bodyClassName="flex items-center justify-center gap-2"
                onClick={onCopy}>
                <p className="text-sm">Copy Referral Link</p>
                <Copy className="h-auto w-4" />
              </Button>
              <Button
                theme="pixel"
                className="w-full py-2"
                bodyClassName="flex items-center justify-center gap-2"
                onClick={() => {
                  openLink(DATA_HUB_DASHBOARD_LINK);
                }}>
                <p className="text-sm">Dashboard</p>
                <ArrowRight className="h-auto w-4" />
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col items-center justify-between pt-20 pb-30">
        <div className="flex flex-col items-center gap-7">
          <div className="flex w-1/3 flex-col gap-3">
            <Logo className="h-auto w-full" />
            <PublicAI className="text-white-100 h-auto w-full" />
          </div>
          <p className="text-white-100 text-2xl font-medium">Data Hunter</p>
        </div>
        {loading ? (
          <Loading className="size-20 animate-spin text-purple-600" />
        ) : (
          <Button
            theme="pixel"
            className="w-2/3 py-2 text-lg font-semibold"
            onClick={onConnect}>
            Connect Account
          </Button>
        )}
      </div>
    );
  }, [loading, onCopy, onRefresh, userInfo]);

  return (
    <div className="relative h-full bg-black bg-linear-to-b from-[#4C2D9A] via-[#4c2d9a]/82 via-20% to-[#424c5f]/0">
      <GridPattern />
      <div className="absolute inset-0 z-10">{element}</div>
    </div>
  );
}
