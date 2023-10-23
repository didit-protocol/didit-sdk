import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditButton } from '../DiditButton';
import CoinbaseIcon from '../Icons/CoinbaseIcon';

interface DiditConnectWalletButtonProps {
  className?: string;
  dataTestId?: string;
}

const DiditConnectWalletButton: FC<DiditConnectWalletButtonProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { isAuthenticated, loginWithWallet } = useDiditAuth();

  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      icon={<CoinbaseIcon />}
      isDisabled={isAuthenticated}
      label="Continue with wallet"
      onClick={loginWithWallet}
    />
  );
};

export default DiditConnectWalletButton;
