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
  DiditTokenInfo,
  DiditTokensData,
  DiditUser,
} from '../../types';
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
  // const {
  //   remove: removeAuthTokens,
  //   set: setAuthTokens,
  //   value: authTokens,
  // } = useLocalStorageValue<{
  //   accessToken: string;
  //   refreshToken: string;
  //   authMethod: DiditAuthMethod;
  // }>(DIDIT.TOKEN_COOKIE_NAME, {
  //   initializeWithValue: false,
  // });

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

  const [status, setStatus] =
    useState<AuthenticationStatus>(INITIAL_AUTH_STATUS);
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
      removeTokens();
      setError('');
    }
    onLogout();
  }, [removeAuthMethod, status, removeTokens, onLogout]);

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
    checkAccessToken();
    // TODO: Check if token is valid through Didit Auth service API
    if (!!accessToken && !!authMethod) {
      authenticate(authMethod);
    } else {
      setStatus(AuthenticationStatus.UNAUTHENTICATED);
      deauthenticate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod, accessToken]);

  // // Check token expiration
  // // Todo: call didi api check token expiration
  // // and use refresh token to get new token
  // useEffect(() => {
  //   if (accessToken) {
  //     const token_info = parseJwt(accessToken);
  //     if (token_info.exp * 1000 < Date.now()) {
  //       deauthenticate();
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [accessToken]);

  // Validate configurable props
  useEffect(() => {
    validateClaims();
    validateScope();
  }, [validateClaims, validateScope]);

  const checkAccessToken = useCallback(async () => {
    const response = await fetch(`${DIDIT.DEFAUTL_AUTH_INTOSPECT_PATH}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: 'POST',
    });
    if (response.status === 200) {
      // Handle successful response here
      const decodedJwt = await response.json();
      // console.log('decodedJwt', decodedJwt);
      if (decodedJwt.active) {
        return decodedJwt;
      }
    } else if (response.status === 401) {
      // console.log('401');
      // const newTokens = await rotateTokens();
    } else {
      const errorData = await response.json();
      // console.log('errorData', errorData);
      throw new Error(errorData);
    }
  }, [accessToken]);

  // const rotateTokens = useCallback(async () => {
  //   const formBodyJoined = `grant_type=refresh_token&client_id=${clientId}&refresh_token=${refreshToken}`;

  //   const response = await fetch(`${DIDIT.DEFAULT_AUTH_ROTATE_TOKEN_PATH}`, {
  //     body: formBodyJoined,
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  //     },
  //     method: 'POST',
  //   });
  //   if (response.ok) {
  //     // Handle successful response here
  //     return await response.json();
  //   } else {
  //     const errorData = await response.json();
  //     throw new Error(errorData);
  //   }
  // }, [clientId, refreshToken]);

  const contextValue = useMemo(
    () => ({
      accessToken,
      accessTokenInfo,
      authMethod,
      availableAuthMethods: authMethods,
      error,
      logout: deauthenticate,
      refreshToken,
      status,
      user,
    }),
    [
      refreshToken,
      authMethod,
      authMethods,
      deauthenticate,
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
        emailAuthBaseUrl={emailAuthBaseUrl}
        emailAuthorizationPath={emailAuthorizationPath}
        emailRedirectionPath={emailRedirectionPath}
        error={error}
        onAuthenticate={authenticate}
        onDeauthenticate={deauthenticate}
        onError={handleError}
        onUpdateTokens={updateTokens}
        scope={scope}
        status={status}
        token={accessToken}
      >
        <ConditionalWalletProvider
          {...RainbowKitProps}
          authMethod={authMethod}
          claims={claims}
          error={error}
          onAuthenticate={authenticate}
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
