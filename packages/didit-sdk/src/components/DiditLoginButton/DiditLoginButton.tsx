import React, { FC, useCallback, useEffect } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditAuthMethod } from '../../types';
import { DiditButton } from '../DiditButton';

interface DiditLoginButtonProps {
  authMethod: DiditAuthMethod;
  className?: string;
  dataTestId?: string;
  label?: string;
}

const DiditLoginButton: FC<DiditLoginButtonProps> = ({
  authMethod,
  className = '',
  dataTestId = '',
  label = 'Login with Didit',
}) => {
  const { availableAuthMethods, isAuthenticated, login } = useDiditAuth();

  const loginWith = useCallback(() => login(authMethod), [authMethod, login]);

  // Validate authMethod
  useEffect(() => {
    if (authMethod && !availableAuthMethods.includes(authMethod)) {
      throw new Error(
        `Invalid authMethod: ${authMethod}. Must be one of defined ones in DiditAuthProvider: ${availableAuthMethods.join(
          ', '
        )}`
      );
    }
  }, [authMethod, availableAuthMethods]);

  const isButtonDisabled =
    !availableAuthMethods.includes(authMethod) || isAuthenticated;

  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      isDisabled={isButtonDisabled}
      label={label}
      onClick={loginWith}
    />
  );
};

export default DiditLoginButton;
