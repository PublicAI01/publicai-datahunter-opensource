import { useMemo } from 'react';

import { NumberTicker } from '@/components/NumberTicker';
import { cn, validatedDataFormatter } from '@/utils';

interface DataValidatedButtonProps extends React.ComponentProps<'button'> {
  value?: number;
}

const DataValidatedButton = (props: DataValidatedButtonProps) => {
  const { className, style, value, ...rest } = props;

  const formattedValue = useMemo(
    () => validatedDataFormatter(value ?? 0),
    [value],
  );

  return (
    <button
      className={cn(
        'group relative z-0 my-6 flex w-3/4 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-purple-500/60 p-2.5 whitespace-nowrap transition-transform duration-300 ease-in-out [background:var(--bg)] active:translate-y-px',
        className,
      )}
      style={
        {
          '--bg': '#0E0E11',
          '--cut': '0.1em',
          '--radius': '12px',
          '--spread': '90deg',
          '--speed': '3s',
          '--shimmer-color': '#ffffff',
          ...style,
        } as React.CSSProperties
      }
      {...rest}>
      {/* spark container */}
      <div className="[container-type:size] absolute inset-0 -z-30 overflow-visible blur-[2px]">
        {/* spark */}
        <div className="animate-shimmer-slide absolute inset-0 [aspect-ratio:1] h-[100cqh] [border-radius:0] [animation-duration:var(--speed)] [mask:none]">
          {/* spark before */}
          <div className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [animation-duration:calc(var(--speed)*2)] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>

      {/* content */}
      <div className="flex w-full items-center justify-between text-sm text-purple-200">
        <p>Data validated today</p>
        <p>
          <NumberTicker
            value={Number(formattedValue.value)}
            decimalPlaces={1}
          />
          <span className="text-xs">{formattedValue.suffix}</span>
        </p>
      </div>

      {/* highlight */}
      <div className="insert-0 absolute size-full transform-gpu [border-radius:calc(var(--radius)-1px)] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />

      {/* backdrop */}
      <div className="absolute [inset:var(--cut)] -z-20 [border-radius:var(--radius)] [background:var(--bg)]" />
    </button>
  );
};

export default DataValidatedButton;
