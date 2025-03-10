import { useCallback, useEffect, useRef } from 'react';

import { MessageType } from '@/utils/messageEvent';

export default function Offscreen() {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const onPing = useCallback(() => {
    try {
      /**
       * hidden interaction logic with AI.
       */
      void chrome.runtime.sendMessage<MessageType>({
        type: 'ping',
        target: 'popup',
        data: { msg: 'success' },
      });
    } catch (error) {
      void chrome.runtime.sendMessage<MessageType>({
        type: 'ping',
        target: 'popup',
        data: { msg: 'error', data: error },
      });
    }
  }, []);

  const startInterval = useCallback(
    () =>
      setInterval(() => {
        onPing();
      }, 300000),
    [onPing],
  );

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (
      message: MessageType,
      sender,
    ) {
      if (message.target === 'offscreen' && sender.id === chrome.runtime.id) {
        switch (message.type) {
          case 'stepup': {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            onPing();
            intervalRef.current = startInterval();
            break;
          }
          default:
            break;
        }
      }
      return undefined;
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startInterval, intervalRef, onPing]);

  return <div>offscreen</div>;
}
