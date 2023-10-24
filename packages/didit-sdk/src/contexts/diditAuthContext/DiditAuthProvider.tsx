import { useLocalStorageValue } from '@react-hookz/web';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DIDIT } from '../../config';
import usePreviousState from '../../hooks/usePreviousState';
import { AuthenticationStatus, DiditAuthMethod } from '../../types';
import { parseJwt } from '../../utils';
import { DiditEmailAuthProvider } from '../diditEmailAuthContext';
import { DiditWalletProvider } from '../diditWalletContext';
import { DiditAuthContext } from './diditAuthContext';

const INITIAL_AUTH_STATUS = AuthenticationStatus.LOADING;

interface DiditAuthProviderProps {
  emailAuthBaseUrl?: string;
  walletAuthBaseUrl?: string;
  children: React.ReactNode;
  clientId: string;
  claims?: string;
  authMethods?: DiditAuthMethod[];
  emailAuthorizationPath?: string;
  emailRedirectionPath?: string;
  onError?: (error: string) => void;
  onLogin: (authMethod?: DiditAuthMethod) => void;
  onLogout?: () => void;
  tokenAuthorizationPath?: string;
  walletAuthorizationPath?: string;
  scope?: string;
}

/*
The DiditAuthProvider provides authentication for the Didit SDK.
It is a wrapper around the DiditEmailAuthProvider (email and social) and the DiditWalletAuthProvider (wallet).
It is used to authenticate users with their email address, social media accounts or wallet address.
*/

const DiditAuthProvider = ({
  authMethods = DIDIT.DEFAULT_AUTH_METHODS,
  children,
  claims = DIDIT.DEFAULT_CLAIMS,
  clientId,
  emailAuthBaseUrl = DIDIT.DEFAULT_EMAIL_AUTH_BASE_URL,
  emailAuthorizationPath = DIDIT.DEFAULT_EMAIL_AUTH_AUTHORIZATION_PATH,
  emailRedirectionPath = DIDIT.DEFAULT_EMAIL_AUTH_REDIRECT_URI_PATH,
  onError = () => {},
  onLogin = () => {},
  onLogout = () => {},
  scope = DIDIT.DEFAULT_SCOPE,
  tokenAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_TOKEN_PATH,
  walletAuthBaseUrl = DIDIT.DEFAULT_WALLET_AUTH_BASE_URL,
  walletAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_AUTHORIZATION_PATH,
}: DiditAuthProviderProps) => {
  const {
    remove: removeToken,
    set: setToken,
    value: token,
  } = useLocalStorageValue<string>(DIDIT.TOKEN_COOKIE_NAME, {
    initializeWithValue: false,
  });

  const {
    remove: removeAuthMethod,
    set: setAuthMethod,
    value: authMethod,
  } = useLocalStorageValue<DiditAuthMethod>(DIDIT.AUTH_METHOD_COOKIE_NAME, {
    initializeWithValue: false,
  });

  const [status, setStatus] =
    useState<AuthenticationStatus>(INITIAL_AUTH_STATUS);
  const prevStatus = usePreviousState(status);
  const [error, setError] = useState('');

  const authenticate = useCallback(
    (_authMethod: DiditAuthMethod) => {
      setAuthMethod(_authMethod);

      if (status !== AuthenticationStatus.AUTHENTICATED) {
        setStatus(AuthenticationStatus.AUTHENTICATED);
      }
    },
    [setAuthMethod, status]
  );

  const deauthenticate = useCallback(() => {
    removeAuthMethod();
    if (status !== AuthenticationStatus.UNAUTHENTICATED) {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
      removeToken();
      setError('');
    }
  }, [removeAuthMethod, status, removeToken]);

  const handleError = useCallback(
    (error: string) => {
      const stringError = String(error);
      setError(String(stringError));
      if (error) onError(stringError);
    },
    [setError, onError]
  );

  const validateClaims = useCallback(() => {
    // Check if claims is a valid string with one or more claims separated by spaces
    const claimsRegex = /^(\w+:\w+)(\s\w+:\w+)*$/;
    if (!claimsRegex.test(claims)) {
      throw new Error(
        "Invalid claims. Claims must be a string of the form 'read:claim write:claim'."
      );
    }
    return true;
  }, [claims]);

  const validateScope = useCallback(() => {
    // Check if scope is a valid string with one or more scopes separated by spaces
    const scopeRegex = /^(\w+)(\s\w+)*$/;
    if (!scopeRegex.test(scope)) {
      throw new Error(
        "Invalid scope. Scope must be a string of the form 'openid profile'."
      );
    }
    return true;
  }, [scope]);

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // TODO: check if token is valid through didi api
    if (!!token && !!authMethod) {
      authenticate(authMethod);
      onLogin(authMethod);
    } else {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod, token]);

  // Check token expiration
  // Todo: call didi api check token expiration
  // and use refresh token to get new token
  useEffect(() => {
    if (token) {
      const token_info = parseJwt(token);
      if (token_info.exp * 1000 < Date.now()) {
        removeToken();
        removeAuthMethod();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Login and logout event callbacks
  useEffect(() => {
    if (
      prevStatus === AuthenticationStatus.UNAUTHENTICATED &&
      status === AuthenticationStatus.AUTHENTICATED
    ) {
      onLogin(authMethod);
    } else if (
      prevStatus === AuthenticationStatus.AUTHENTICATED &&
      status === AuthenticationStatus.UNAUTHENTICATED
    ) {
      onLogout();
    }
  }, [prevStatus, status, authMethod, onLogin, onLogout]);

  // Validate configurable props
  useEffect(() => {
    validateClaims();
    validateScope();
  }, [validateClaims, validateScope]);

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
        claims={claims}
        clientId={clientId}
        emailAuthBaseUrl={emailAuthBaseUrl}
        emailAuthorizationPath={emailAuthorizationPath}
        emailRedirectionPath={emailRedirectionPath}
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
          claims={claims}
          error={error}
          onAuthenticate={authenticate}
          onDeauthenticate={deauthenticate}
          onError={handleError}
          onUpdateToken={setToken}
          scope={scope}
          status={status}
          token={token}
          tokenAuthorizationPath={tokenAuthorizationPath}
          walletAuthBaseUrl={walletAuthBaseUrl}
          walletAuthorizationPath={walletAuthorizationPath}
        >
          {children}
        </DiditWalletProvider>
      </DiditEmailAuthProvider>
    </DiditAuthContext.Provider>
  );
};

export default DiditAuthProvider;
