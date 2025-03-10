import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';

interface ToastOptions {
  text?: string;
  time?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {
    throw Error('Not implemented');
  },
});

const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const countRef = useRef(0);
  const [queue, setQueue] = useState<
    (ToastOptions & { key: number; start: number })[]
  >([]);
  const show = useMemo(() => queue.length > 0, [queue.length]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setQueue((queue) => [
      ...queue,
      { ...options, key: countRef.current++, start: new Date().getTime() },
    ]);
  }, []);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
    }
    if (show) {
      interval.current = setInterval(() => {
        const now = new Date().getTime();
        setQueue((queue) =>
          queue.filter((toast) => now - toast.start < (toast.time ?? 3000)),
        );
      }, 1000);
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [show]);

  const value = useMemo<ToastContextType>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {show &&
        createPortal(
          <div className="absolute top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-3">
            <AnimatePresence>
              {queue.map((options) => (
                <m.div
                  key={options.key}
                  className="pointer-events-auto w-min rounded-lg bg-black/60 p-2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}>
                  <p className="text-base font-medium text-white">
                    {options.text}
                  </p>
                </m.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};

export { ToastContext, ToastProvider };
