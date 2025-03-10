import CoinIcon from '@/assets/public-coin.svg?react';
import { cn } from '@/utils';

type CoinProps = React.ComponentProps<typeof CoinIcon>;

const Coin = (props: CoinProps) => {
  const { className, ...rest } = props;

  return (
    <CoinIcon
      className={cn(className)}
      {...rest}></CoinIcon>
  );
};

export default Coin;
