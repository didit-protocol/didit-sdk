import clsx from 'clsx';
import React, { FC } from 'react';
import { Box } from '../Box/Box';
import { ConnectButton } from '../ConnectButton/ConnectButton';
interface LoginProps {
  className?: string;
  dataTestId?: string;
}

const LoginModal: FC<LoginProps> = ({ className = '', dataTestId = '' }) => {
  const LoginClassName = clsx(className);

  return (
    <div className={LoginClassName} data-testid={dataTestId}>
      <Box display="flex" flexDirection="column" gap="10" padding="10">
        <div>Email</div>
        <div>Social</div>
        <ConnectButton />
      </Box>
    </div>
  );
};

export default LoginModal;
