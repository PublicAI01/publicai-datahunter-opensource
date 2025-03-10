import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import browser from 'webextension-polyfill';

import { AppError } from '@/utils/http';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const sleep = async (ms: number | undefined = 3000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fmtError = (error: unknown) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return (error as { msg?: string } | undefined)?.msg ?? 'failed';
};

const fmtNotificationError = (
  error: unknown,
): browser.Notifications.CreateNotificationOptions => {
  let title = 'Tips';
  let message = fmtError(error);
  if (error instanceof AppError) {
    if (error.code === 401) {
      title = 'Login Expired';
      message = 'Reconnect to continue earning PublicAI points.';
    }
  }

  return {
    type: 'basic',
    title,
    iconUrl: browser.runtime.getURL('icon/48.png'),
    message,
  };
};

const omitText = (str: string) => str.replace(/^(.{4})(.*)(.{4})$/, '$1....$3');

const openLink = (link: string) =>
  window.open(link, '_blank', 'noreferrer=true');

const debounce = (fn: () => void, delay: number, immediate = true) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let isInvoke = false;

  const _debounce = () => {
    if (timer) clearTimeout(timer);

    if (immediate && !isInvoke) {
      fn();
      isInvoke = true;
    } else {
      timer = setTimeout(() => {
        fn();
        isInvoke = false;
      }, delay);
    }
  };

  return _debounce;
};

const validatedDataFormatter = (num: number, precision: number = 1) => {
  const map = [
    { suffix: 'YB', threshold: Math.pow(1024, 6) },
    { suffix: 'ZB', threshold: Math.pow(1024, 5) },
    { suffix: 'EB', threshold: Math.pow(1024, 4) },
    { suffix: 'PB', threshold: Math.pow(1024, 3) },
    { suffix: 'TB', threshold: Math.pow(1024, 2) },
    { suffix: 'GB', threshold: Math.pow(1024, 1) },
    { suffix: 'MB', threshold: Math.pow(1024, 0) },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    return {
      value: (num / found.threshold).toFixed(precision),
      suffix: found.suffix,
    };
  }

  return { value: '0', suffix: 'MB' };
};

const ERROR_MAP = {
  'abnormal environment': 'EnvError',
  'does not contain text information': 'MissingContent',
  'unexpected token': 'SyntaxErr',
  'failed to fetch': 'NetworkErr',
  'permission denied': 'AuthFailed',
  timeout: 'Timeout',
  'invalid argument': 'BadInput',
  'not found': 'NotFound',
} as const;

type ErrorMapKey = keyof typeof ERROR_MAP;

const shortenError = (error: unknown) => {
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  const matchedKey = Object.keys(ERROR_MAP).find((key) =>
    message.toLowerCase().includes(key),
  ) as ErrorMapKey | undefined;

  return matchedKey
    ? ERROR_MAP[matchedKey]
    : `${message.split(':')[0].slice(0, 15)}...`;
};

export {
  cn,
  debounce,
  fmtError,
  fmtNotificationError,
  omitText,
  openLink,
  shortenError,
  sleep,
  validatedDataFormatter,
};
