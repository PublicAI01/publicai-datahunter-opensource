import Right from '@/assets/arrow-right.svg?react';
import { cn } from '@/utils';

type ArrowProps = React.ComponentProps<typeof Right>;

const ArrowRight = (props: ArrowProps) => {
  const { className, ...rest } = props;

  return (
    <Right
      className={cn(className)}
      {...rest}
    />
  );
};

export { ArrowRight };
