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
  authMethods?: DiditAuthMethod[];
  onError?: (error: string) => void;
  onLogin: (authMethod: DiditAuthMethod) => void;
  onLogout?: () => void;
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
  onError = () => {},
  onLogin = () => {},
  onLogout = () => {},
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
      setAuthMethod(_authMethod);

      if (status !== AuthenticationStatus.AUTHENTICATED) {
        setStatus(AuthenticationStatus.AUTHENTICATED);
        onLogin(_authMethod);
      }
    },
    [status, setStatus, onLogin]
  );

  const deauthenticate = useCallback(() => {
    setAuthMethod(undefined);

    if (status !== AuthenticationStatus.UNAUTHENTICATED) {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
      setToken('');
      setError('');
      onLogout();
    }
  }, [status, setStatus, onLogout, setToken, setError]);

  const handleError = useCallback(
    (error: string) => {
      setError(error);
      if (error) onError(error);
    },
    [setError, onError]
  );

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
      logout: deauthenticate,
      status,
      token,
    }),
    [authMethod, authMethods, deauthenticate, error, status, token]
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
        onError={handleError}
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
          onError={handleError}
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
