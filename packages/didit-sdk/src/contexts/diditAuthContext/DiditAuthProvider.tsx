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
  DiditAuthMethod,
  DiditAuthStatus,
  DiditEmailAuthMode,
  DiditTokenInfo,
  DiditTokensData,
  DiditUser,
} from '../../types';
import decodeAccessToken from '../../utils/decodeAccessToken';
import { DiditEmailAuthProvider } from '../diditEmailAuthContext';
import { ConditionalWalletProvider } from '../diditWalletContext';
import { DiditAuthContext } from './diditAuthContext';

const INITIAL_AUTH_STATUS = DiditAuthStatus.UNAUTHENTICATED;

type DiditAuthProviderProps = {
  authBaseUrl?: string;
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
  authBaseUrl = DIDIT.DEFAULT_AUTH_BASE_URL,
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
    remove: removeAccessToken,
    set: setAccessToken,
    value: accessToken,
  } = useLocalStorageValue<string>(DIDIT.TOKEN_COOKIE_NAME, {
    initializeWithValue: false,
  });
  const {
    remove: removeRefreshToken,
    set: setRefreshToken,
    value: refreshToken,
  } = useLocalStorageValue<string>(DIDIT.REFRESH_TOKEN_COOKIE_NAME, {
    initializeWithValue: false,
  });

  const {
    remove: removeAuthMethod,
    set: setAuthMethod,
    value: authMethod,
  } = useLocalStorageValue<DiditAuthMethod>(DIDIT.AUTH_METHOD_COOKIE_NAME, {
    initializeWithValue: false,
  });

  const [status, setStatus] = useState<DiditAuthStatus>(INITIAL_AUTH_STATUS);
  const [error, setError] = useState('');

  const accessTokenInfo: DiditTokenInfo | undefined = useMemo(
    () => (accessToken ? decodeAccessToken(accessToken) : undefined),
    [accessToken]
  );

  const user: DiditUser | undefined = useMemo(
    () =>
      accessTokenInfo
        ? {
            identifier: accessTokenInfo.identifier,
            identifierType: accessTokenInfo.identifier_type,
            sub: accessTokenInfo.sub,
          }
        : undefined,
    [accessTokenInfo]
  );

  const updateTokens = useCallback(
    (tokens: DiditTokensData) => {
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
    },
    [setAccessToken, setRefreshToken]
  );

  const removeTokens = useCallback(() => {
    removeAccessToken();
    removeRefreshToken();
  }, [removeAccessToken, removeRefreshToken]);

  const authenticate = useCallback(
    (_authMethod: DiditAuthMethod) => {
      setAuthMethod(_authMethod);
      if (status !== DiditAuthStatus.AUTHENTICATED) {
        setStatus(DiditAuthStatus.AUTHENTICATED);
        onLogin(_authMethod);
      }
    },
    [setAuthMethod, status, onLogin]
  );

  // logoutFromDidit is used to logout from the Didit service.
  const logoutFromDidit = useCallback(async () => {
    try {
      const url = `${authBaseUrl}${DIDIT.EMAIL_AUTH_LOGOUT_PATH}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
  }, [accessToken, authBaseUrl]);

  // deauthenticate is used to force a frontend only logout. It remvoes all authentication data from the browser
  const deauthenticate = useCallback(() => {
    setStatus(DiditAuthStatus.UNAUTHENTICATED);
    removeTokens();
    removeAuthMethod();
    setError('');
  }, [removeAuthMethod, removeTokens]);

  // forceCompleteLogout is used to force a complete logout from the Didit service and from the frontend.
  const forceCompleteLogout = useCallback(() => {
    if (accessToken) logoutFromDidit(); // Logout from Didit service
    deauthenticate(); // Remove all authentication data from the browser
  }, [accessToken, logoutFromDidit, deauthenticate]);

  // logout is the callback used to logout from the SDK.
  const logout = useCallback(async () => {
    try {
      if (status === DiditAuthStatus.AUTHENTICATED && !!accessToken) {
        await logoutFromDidit();
      }
      deauthenticate();
      onLogout();
    } catch (error) {
      onError(String(error));
    }
  }, [deauthenticate, logoutFromDidit, onLogout, onError, status, accessToken]);

  const handleError = useCallback(
    (error: string) => {
      const stringError = String(error);
      setError(String(stringError));
      if (error) onError(stringError);
    },
    [setError, onError]
  );

  const rotateTokens = useCallback(async () => {
    const payload = {
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const response = await fetch(
      `${authBaseUrl}${DIDIT.AUTH_ROTATE_TOKEN_PATH}`,
      {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );
    if (response.ok) {
      // Handle successful response here
      const newtokens = await response.json();
      const { access_token, refresh_token } = newtokens;
      updateTokens({ access_token, refresh_token });
      // User is only authenticated when the token has been validated or rotated (status is loading until then)
      authenticate(authMethod as DiditAuthMethod);
    } else {
      deauthenticate();
      console.warn('unable to refresh token');
    }
  }, [
    authBaseUrl,
    clientId,
    refreshToken,
    authMethod,
    authenticate,
    updateTokens,
    deauthenticate,
  ]);

  const checkAccessToken = useCallback(async () => {
    const response = await fetch(`${authBaseUrl}${DIDIT.AUTH_INTOSPECT_PATH}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
    });

    if (response.status === 200) {
      // Handle successful response here
      const decodedJwt = await response.json();
      if (decodedJwt.active === true) {
        // User is only authenticated when the token has been validated or rotated (status is loading until then)
        authenticate(authMethod as DiditAuthMethod);
      } else {
        // refresh token
        await rotateTokens();
      }
    } else if (response.status === 401) {
      await rotateTokens();
    } else {
      deauthenticate();
      console.warn('Invalid access token');
    }
  }, [
    authBaseUrl,
    accessToken,
    deauthenticate,
    rotateTokens,
    authMethod,
    authenticate,
  ]);

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

    if (!!accessToken && !!authMethod) {
      try {
        setStatus(DiditAuthStatus.LOADING); // Set status to loading while checking the access token
        checkAccessToken();
      } catch (error) {
        console.warn('Error checking access token: ', error);
        // Consolidate logout status in both frontend and backend
        forceCompleteLogout();
      }
    } else if (status !== DiditAuthStatus.LOADING) {
      // Consolidate logout status in both frontend and backend
      forceCompleteLogout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod, accessToken]);

  // Validate configurable props
  useEffect(() => {
    validateClaims();
    validateScope();
  }, [validateClaims, validateScope]);

  const contextValue = useMemo(
    () => ({
      accessToken,
      accessTokenInfo,
      authMethod,
      availableAuthMethods: authMethods,
      error,
      logout,
      refreshToken,
      status,
      user,
    }),
    [
      refreshToken,
      authMethod,
      authMethods,
      logout,
      error,
      status,
      accessToken,
      accessTokenInfo,
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
        emailAuthBaseUrl={authBaseUrl}
        emailAuthMode={emailAuthMode}
        error={error}
        onAuthenticate={setAuthMethod}
        onDeauthenticate={deauthenticate}
        onError={handleError}
        onUpdateAuthMethod={setAuthMethod}
        onUpdateTokens={updateTokens}
        redirectUri={redirectUri}
        scope={scope}
        status={status}
        token={accessToken}
      >
        <ConditionalWalletProvider
          {...RainbowKitProps}
          authMethod={authMethod}
          claims={claims}
          error={error}
          onAuthenticate={setAuthMethod}
          onDeauthenticate={deauthenticate}
          onError={handleError}
          onUpdateTokens={updateTokens}
          scope={scope}
          status={status}
          token={accessToken}
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
