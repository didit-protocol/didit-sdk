import React, { FC } from 'react';
import { DiditButton } from '../DiditButton';
import CoinbaseIcon from '../Icons/CoinbaseIcon';
import { useConnectModal } from '../RainbowKitProvider/ModalContext';

interface DiditConnectWalletButtonProps {
  className?: string;
  dataTestId?: string;
}

const DiditConnectWalletButton: FC<DiditConnectWalletButtonProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { openConnectModal } = useConnectModal();
  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      icon={<CoinbaseIcon />}
      label="Continue with wallet"
      onClick={openConnectModal}
    />
  );
};

export default DiditConnectWalletButton;
