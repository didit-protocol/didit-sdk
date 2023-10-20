import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { DIDIT } from '../../config';
import { AuthenticationStatus, DiditAuthMethod } from '../../types';
import { parseJwt } from '../../utils';
import { DiditEmailAuthProvider } from '../diditEmailAuthContext';
import { DiditWalletProvider } from '../diditWalletContext';
import { DiditAuthContext } from './diditAuthContext';

const INITIAL_AUTH_STATUS = AuthenticationStatus.LOADING;

interface DiditAuthProviderProps {
  baseUrl?: string;
  children: React.ReactNode;
  clientId: string;
  claims?: string;
  authMethods: DiditAuthMethod[];
  scope?: string;
}

/*
The DiditAuthProvider provides authentication for the Didit SDK. 
It is a wrapper around the DiditEmailAuthProvider (email and social) and the DiditWalletAuthProvider (wallet).
It is used to authenticate users with their email address, social media accounts or wallet address.
*/
const DiditAuthProvider = ({
  authMethods = DIDIT.DEFAULT_AUTH_METHODS,
  baseUrl = DIDIT.DEFAULT_BASE_URL,
  children,
  claims = DIDIT.DEFAULT_CLAIMS,
  clientId,
  scope = DIDIT.DEFAULT_SCOPE,
}: DiditAuthProviderProps) => {
  const [token, setToken] = useLocalStorage<string>(
    DIDIT.TOKEN_COOKIE_NAME,
    ''
  );

  const [status, setStatus] =
    useState<AuthenticationStatus>(INITIAL_AUTH_STATUS);
  const [error, setError] = useState('');

  const [authMethod, setAuthMethod] = useState<DiditAuthMethod>();

  const authenticate = useCallback(
    (_authMethod: DiditAuthMethod) => {
      setStatus(AuthenticationStatus.AUTHENTICATED);
      setAuthMethod(_authMethod);
    },
    [setStatus]
  );

  const deauthenticate = useCallback(() => {
    setStatus(AuthenticationStatus.UNAUTHENTICATED);
    setAuthMethod(undefined);
  }, [setStatus]);

  const logout = useCallback(() => {
    deauthenticate();
    setToken('');
    setError('');
  }, [deauthenticate, setToken, setError]);

  // Check token expiration
  useEffect(() => {
    if (token) {
      const token_info = parseJwt(token);
      if (token_info.exp * 1000 < Date.now()) {
        setToken('');
      }
    } else {
      setToken('');
    }
  }, [token, setToken]);

  // Clear token if user logs out
  useEffect(() => {
    if (status === AuthenticationStatus.UNAUTHENTICATED) {
      setToken('');
    }
  }, [status, setToken]);

  const contextValue = useMemo(
    () => ({
      authMethod,
      availableAuthMethods: authMethods,
      error,
      login: () => {},
      loginWithApple: () => {},
      loginWithEmail: () => {},
      loginWithGoogle: () => {},
      loginWithSocial: () => {},
      loginWithWallet: () => {},
      logout: logout,
      status,
      token,
    }),
    [authMethod, authMethods, error, logout, status, token]
  );

  return (
    <DiditAuthContext.Provider value={contextValue}>
      <DiditEmailAuthProvider
        authMethod={authMethod}
        baseUrl={baseUrl}
        claims={claims}
        clientId={clientId}
        error={error}
        onAuthenticate={authenticate}
        onDeauthenticate={deauthenticate}
        onError={setError}
        onUpdateToken={setToken}
        scope={scope}
        status={status}
        token={token}
      >
        <DiditWalletProvider
          authMethod={authMethod}
          baseUrl={baseUrl}
          claims={claims}
          error={error}
          onAuthenticate={authenticate}
          onDeauthenticate={deauthenticate}
          onError={setError}
          onUpdateToken={setToken}
          scope={scope}
          status={status}
          token={token}
        >
          {children}
        </DiditWalletProvider>
      </DiditEmailAuthProvider>
    </DiditAuthContext.Provider>
  );
};

export default DiditAuthProvider;
