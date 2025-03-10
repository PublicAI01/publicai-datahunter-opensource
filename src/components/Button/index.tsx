import { useState } from 'react';

import Loading from '@/components/Loading';
import { cn } from '@/utils';

interface ButtonProps
  extends Omit<React.ComponentProps<'button'>, 'children' | 'onClick'> {
  children: React.ReactNode | ((pending: boolean) => React.ReactNode);
  bodyClassName?: string;
  theme?: 'normal' | 'pixel' | 'outlined' | 'none';
  loading?: boolean | 'auto';
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
}

const Button = (props: ButtonProps) => {
  const {
    className,
    bodyClassName,
    theme = 'normal',
    loading = 'auto',
    onClick,
    children,
    ...rest
  } = props;

  const [innerLoading, setInnerLoading] = useState(false);
  const pending = loading === 'auto' ? innerLoading : loading;
  const disabled = rest.disabled || pending;
  const isRender = children instanceof Function;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      setInnerLoading(true);
      await onClick?.(e);
      setInnerLoading(false);
    } catch (e) {
      setInnerLoading(false);
      throw e;
    }
  };

  return (
    <button
      className={cn(
        'relative rounded-xl transition-all duration-300',
        theme === 'normal' &&
          'w-full bg-purple-500 px-5 py-2 text-base text-white',
        theme === 'pixel' &&
          'app-shadow font-pixeloid-sans bg-black-20 px-5 py-2 text-purple-200 active:translate-y-2',
        theme === 'outlined' &&
          'border border-purple-500 bg-white p-2 text-purple-500',
        disabled
          ? 'cursor-not-allowed! opacity-40'
          : 'cursor-pointer active:opacity-75',
        className,
      )}
      {...rest}
      disabled={disabled}
      onClick={(e) => {
        void handleClick(e);
      }}>
      <div
        className={cn(
          bodyClassName,
          !isRender && pending && 'opacity-0 transition-opacity',
        )}>
        {isRender ? children(pending) : children}
      </div>
      {!isRender && pending && (
        <div className="absolute inset-0 flex items-center justify-center invert">
          <Loading />
        </div>
      )}
    </button>
  );
};

export { Button };
