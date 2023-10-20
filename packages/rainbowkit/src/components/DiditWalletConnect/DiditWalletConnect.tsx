import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditButton } from '../DiditButton';
import CoinbaseIcon from '../Icons/CoinbaseIcon';

interface DiditWalletConnectProps {
  className?: string;
  dataTestId?: string;
}

const DiditWalletConnect: FC<DiditWalletConnectProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { loginWithWallet } = useDiditAuth();

  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      icon={<CoinbaseIcon />}
      label="Continue with wallet"
      onClick={loginWithWallet}
    />
  );
};

export default DiditWalletConnect;
