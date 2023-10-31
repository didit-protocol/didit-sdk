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
import {
  AuthenticationStatus,
  DiditAuthMethod,
  DiditTokenData,
  DiditUser,
} from '../../types';
import { parseJwt } from '../../utils';
import decodeAccessToken from '../../utils/decodeAccessToken';
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
  emailLogoutIframePath?: string;
  emailRedirectionPath?: string;
  onError?: (error: string) => void;
  onLogin?: (authMethod?: DiditAuthMethod) => void;
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
  emailLogoutIframePath = DIDIT.DEFAULT_EMAIL_AUTH_LOGOUT_IFRAME_PATH,
  emailRedirectionPath = DIDIT.DEFAULT_EMAIL_AUTH_REDIRECT_URI_PATH,
  onError = () => {},
  onLogin = () => {},
  onLogout = () => {},
  scope = DIDIT.DEFAULT_SCOPE,
  tokenAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_TOKEN_PATH,
  walletAuthBaseUrl = DIDIT.DEFAULT_WALLET_AUTH_BASE_URL,
  walletAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_AUTHORIZATION_PATH,
}: DiditAuthProviderProps) => {
  const firstRender = useRef(true);
  const logoutIframe = useRef<HTMLIFrameElement>(null);

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
    },
    [setAuthMethod, status]
  );

  // logoutFromDidit is used to logout from the Didit service.
  const logoutFromDidit = useCallback(async () => {
    const diditOrigin = new URL(emailAuthBaseUrl).origin;

    // Send logout message to Didit Auth iframe
    debugger;
    logoutIframe.current?.contentWindow?.postMessage(
      {
        type: DIDIT.EMAIL_AUTH_LOGOUT_POST_MESSAGE_TYPE,
      },
      diditOrigin
    );
  }, [emailAuthBaseUrl]);

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

  const handleLogoutIframeMessage = useCallback(
    (event: MessageEvent) => {
      const diditOrigin = new URL(emailAuthBaseUrl).origin;

      if (event.origin.replace(/\/$/, '') !== diditOrigin.replace(/\/$/, ''))
        return;

      // Access the data sent in the message
      const messageData = event?.data;

      // Check if the message is an init response message
      if (messageData?.type === DIDIT.EMAIL_AUTH_LOGOUT_POST_MESSAGE_TYPE) {
        debugger;
        if (messageData.success === false) {
          console.error(messageData.error);
          onError(messageData.error);
        }
      }
    },
    [emailAuthBaseUrl, onError]
  );

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
      onLogin(authMethod);
    } else {
      // Consolidate logout status in both frontend and backend
      forceCompleteLogout();
      onLogout();
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

  // Handle messages from Didit Auth iframe
  useEffect(() => {
    window.addEventListener('message', handleLogoutIframeMessage, false);

    // Clean up the window function when the component unmounts
    return () => {
      window.removeEventListener('message', handleLogoutIframeMessage);
    };
  }, [handleLogoutIframeMessage]);

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

  return (
    <DiditAuthContext.Provider value={contextValue}>
      <iframe
        height="0"
        id="logout-iframe"
        ref={logoutIframe}
        src={`${emailAuthBaseUrl}${emailLogoutIframePath}`}
        title="Didit Logout Iframe"
        width="0"
      />
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
