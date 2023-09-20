import React, { FC } from 'react';
import { Box } from '../Box/Box';
import Login from '../Login/Login';

interface LoginEmbeddedProps {
  className?: string;
  dataTestId?: string;
}

const LoginEmbedded: FC<LoginEmbeddedProps> = ({
  className = '',
  dataTestId = '',
}) => {
  return (
    <Box
      borderColor="accentColor"
      borderRadius="10"
      borderStyle="solid"
      borderWidth="1"
      className={className}
      padding="10"
      testId={dataTestId}
    >
      <Login />
    </Box>
  );
};

export default LoginEmbedded;
