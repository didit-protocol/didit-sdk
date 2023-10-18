import clsx from 'clsx';
import { SocialAuthProvider, useDiditEmailAuthContext } from 'didit-provider';
import React, { FC } from 'react';
import { Box } from '../Box/Box';

interface DiditLoginProps {
  className?: string;
  dataTestId?: string;
}

const DiditLogin: FC<DiditLoginProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { login } = useDiditEmailAuthContext();

  const connectWithGoogle = () => login(SocialAuthProvider.GOOGLE);

  const diditLoginClassName = clsx(className);

  return (
    <div className={diditLoginClassName} data-testid={dataTestId}>
      <Box
        alignItems="center"
        aria-label="Chain Selector"
        as="button"
        background="connectButtonBackground"
        borderRadius="connectButton"
        boxShadow="connectButton"
        color="connectButtonText"
        fontFamily="body"
        fontWeight="bold"
        gap="6"
        onClick={connectWithGoogle}
        paddingX="10"
        paddingY="8"
        transition="default"
        type="button"
      >
        Connect with Google
      </Box>
    </div>
  );
};

export default DiditLogin;
