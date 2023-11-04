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
  DiditEmailAuthMode,
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
  walletAuthBaseUrl?: string;
  children: React.ReactNode;
  clientId: string;
  claims?: string;
  authMethods?: DiditAuthMethod[];
  emailAuthMode?: DiditEmailAuthMode;
  emailLogoutPath?: string;
  onError?: (error: string) => void;
  onLogin?: (authMethod?: DiditAuthMethod) => void;
  onLogout?: () => void;
  redirectUri: string;
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
  emailAuthMode = DIDIT.DEFAULT_EMAIL_AUTH_MODE,
  onError = () => {},
  onLogin = () => {},
  onLogout = () => {},
  redirectUri,
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
        onLogin(_authMethod);
      }
    },
    [setAuthMethod, status, onLogin]
  );

  // logoutFromDidit is used to logout from the Didit service.
  const logoutFromDidit = useCallback(async () => {
    try {
      const url = `${DIDIT.EMAIL_AUTH_BASE_URL}${DIDIT.EMAIL_AUTH_LOGOUT_PATH}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });

      if (response.ok) {
        return Promise.resolve();
      } else {
        return Promise.reject(
          `Error logging out from Didit: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('Error logging out from Didit: ', error);
      return Promise.reject(error);
    }
  }, [token]);

  // deauthenticate is used to force a frontend only logout. It remvoes all authentication data from the browser
  const deauthenticate = useCallback(() => {
    setStatus(AuthenticationStatus.UNAUTHENTICATED);
    removeToken();
    removeAuthMethod();
    setError('');
  }, [removeAuthMethod, removeToken]);

  // forceCompleteLogout is used to force a complete logout from the Didit service and from the frontend.
  const forceCompleteLogout = useCallback(() => {
    if (token) logoutFromDidit(); // Logout from Didit service
    deauthenticate(); // Remove all authentication data from the browser
  }, [token, logoutFromDidit, deauthenticate]);

  // logout is the callback used to logout from the SDK.
  const logout = useCallback(async () => {
    try {
      if (status === AuthenticationStatus.AUTHENTICATED && !!token) {
        await logoutFromDidit();
      }
      deauthenticate();
      onLogout();
    } catch (error) {
      onError(String(error));
    }
  }, [deauthenticate, logoutFromDidit, onLogout, onError, status, token]);

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
        "Invalid claims. Claims must be a string of the form 'read:claim'."
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
      // Consolidate logout status in both frontend and backend
      forceCompleteLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod, token]);

  // Check token expiration
  // Todo: call Didit api check token expiration
  // and use refresh token to get new token
  useEffect(() => {
    if (token) {
      const token_info = parseJwt(token);
      if (token_info.exp * 1000 < Date.now()) {
        // We cannot logout from Didit service since the token is expired
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
      logout,
      status,
      token,
      tokenData,
      user,
    }),
    [authMethod, authMethods, logout, error, status, token, tokenData, user]
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
        emailAuthMode={emailAuthMode}
        error={error}
        onAuthenticate={authenticate}
        onDeauthenticate={deauthenticate}
        onError={handleError}
        onUpdateAuthMethod={setAuthMethod}
        onUpdateToken={setToken}
        redirectUri={redirectUri}
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
