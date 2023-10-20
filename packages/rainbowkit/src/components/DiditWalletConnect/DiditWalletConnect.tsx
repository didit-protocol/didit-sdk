import React, { FC } from 'react';
import { DiditButton } from '../DiditButton';
import CoinbaseIcon from '../Icons/CoinbaseIcon';
import { useConnectModal } from '../RainbowKitProvider/ModalContext';

interface DiditWalletConnectProps {
  className?: string;
  dataTestId?: string;
}

const DiditWalletConnect: FC<DiditWalletConnectProps> = ({
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

export default DiditWalletConnect;
