import { useLocalStorageValue } from '@react-hookz/web';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { RainbowKitProviderProps } from '../../components/RainbowKitProvider/DiditRainbowkitProvider';
import { DIDIT } from '../../config';
import {
  AuthenticationStatus,
  DiditAuthMethod,
  DiditTokenData,
  DiditUser,
} from '../../types';
import { parseJwt } from '../../utils';
import decodeAccessToken from '../../utils/decodeAccessToken';
import { DiditEmailAuthProvider } from '../diditEmailAuthContext';
import { ConditionalWalletProvider } from '../diditWalletContext';
import { DiditAuthContext } from './diditAuthContext';

const INITIAL_AUTH_STATUS = AuthenticationStatus.LOADING;

type DiditAuthProviderProps = {
  emailAuthBaseUrl?: string;
  walletAuthBaseUrl?: string;
  children: React.ReactNode;
  clientId: string;
  claims?: string;
  authMethods?: DiditAuthMethod[];
  emailAuthorizationPath?: string;
  emailRedirectionPath?: string;
  onError?: (error: string) => void;
  onLogin?: (authMethod?: DiditAuthMethod) => void;
  onLogout?: () => void;
  tokenAuthorizationPath?: string;
  walletAuthorizationPath?: string;
  scope?: string;
} & RainbowKitProviderProps;

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
  ...RainbowKitProps
}: DiditAuthProviderProps) => {
  const firstRender = useRef(true);
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
  const [error, setError] = useState('');

  const tokenData: DiditTokenData | undefined = useMemo(
    () => (token ? decodeAccessToken(token) : undefined),
    [token]
  );

  const user: DiditUser | undefined = useMemo(
    () =>
      tokenData
        ? {
            identifier: tokenData.identifier,
            identifierType: tokenData.identifier_type,
            sub: tokenData.sub,
          }
        : undefined,
    [tokenData]
  );

  const authenticate = useCallback(
    (_authMethod: DiditAuthMethod) => {
      setAuthMethod(_authMethod);
      if (status !== AuthenticationStatus.AUTHENTICATED) {
        setStatus(AuthenticationStatus.AUTHENTICATED);
      }
      onLogin();
    },
    [setAuthMethod, status, onLogin]
  );

  const deauthenticate = useCallback(() => {
    removeAuthMethod();
    if (status !== AuthenticationStatus.UNAUTHENTICATED) {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
      removeToken();
      setError('');
    }
    onLogout();
  }, [removeAuthMethod, status, removeToken, onLogout]);

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

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // TODO: Check if token is valid through Didit Auth service API
    if (!!token && !!authMethod) {
      authenticate(authMethod);
    } else {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
      deauthenticate();
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
        deauthenticate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
      tokenData,
      user,
    }),
    [
      authMethod,
      authMethods,
      deauthenticate,
      error,
      status,
      token,
      tokenData,
      user,
    ]
  );

  const useWalletProvider = useMemo(
    () => authMethods.includes(DiditAuthMethod.WALLET),
    [authMethods]
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
        <ConditionalWalletProvider
          {...RainbowKitProps}
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
          // conditionally render the wallet provider based on the authMethods prop
          useWalletProvider={useWalletProvider}
          walletAuthBaseUrl={walletAuthBaseUrl}
          walletAuthorizationPath={walletAuthorizationPath}
        >
          {children}
        </ConditionalWalletProvider>
      </DiditEmailAuthProvider>
    </DiditAuthContext.Provider>
  );
};

export default DiditAuthProvider;
