import { useLocalStorageValue } from '@react-hookz/web';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { DIDIT } from '../../config';
import {
  AuthenticationStatus,
  DiditAuthMethod,
  DiditEmailAuthMode,
  DiditTokensData,
  SocialAuthProvider,
} from '../../types';
import { generateCodeChallenge, generateCodeVerifier } from '../../utils';
import { DiditEmailAuthContext } from './diditEmailAuthContext';

interface DiditEmailAuthProviderProps {
  authMethod?: DiditAuthMethod;
  children: React.ReactNode;
  claims: string;
  clientId: string;
  emailAuthMode?: DiditEmailAuthMode;
  error?: string;
  onAuthenticate?: (_authMethod: DiditAuthMethod) => void;
  onDeauthenticate?: () => void;
  onError?: (error: string) => void;
  onUpdateTokens?: (tokens: DiditTokensData) => void;
  onUpdateAuthMethod?: (authMethod: DiditAuthMethod) => void;
  redirectUri: string;
  scope: string;
  status: AuthenticationStatus;
  token?: string;
}

const DiditEmailAuthProvider = ({
  authMethod = undefined,
  children,
  claims = '',
  clientId,
  emailAuthMode = DIDIT.DEFAULT_EMAIL_AUTH_MODE,
  error,
  onAuthenticate = () => {},
  onDeauthenticate = () => {},
  onError = () => {},
  onUpdateAuthMethod = () => {},
  onUpdateTokens = () => {},
  redirectUri,
  scope,
  status,
  token,
}: DiditEmailAuthProviderProps) => {
  const {
    remove: removeCodeVerifier,
    set: setCodeVerifier,
    value: codeVerifier,
  } = useLocalStorageValue<string>(DIDIT.EMAIL_AUTH_CODE_VERIFIER_COOKIE_NAME, {
    defaultValue: '',
    initializeWithValue: false,
  });

  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!codeVerifier) {
      const _codeVerifier = generateCodeVerifier();
      setCodeVerifier(_codeVerifier);
    }
  }, [codeVerifier, setCodeVerifier]);

  const {
    remove: removeSocialAuthProvider,
    set: setSocialAuthProvider,
    value: socialAuthProvider,
  } = useLocalStorageValue<string>(
    DIDIT.EMAIL_AUTH_SOCIAL_AUTH_PROVIDER_COOKIE_NAME,
    {
      defaultValue: '',
      initializeWithValue: false,
    }
  ); // Temporary storage for the social auth provider while the user is authenticating

  const handleTokenError = useCallback(
    (_error: string, _errorDescription: string) => {
      console.error(_error, _errorDescription);
      onError(_error);
      onDeauthenticate();
      removeSocialAuthProvider();
      removeCodeVerifier();
    },
    [onError, onDeauthenticate, removeCodeVerifier, removeSocialAuthProvider]
  );

  const handleTokenSuccess = useCallback(
    (tokenData: DiditTokensData) => {
      if (!tokenData?.access_token)
        handleTokenError(
          'Didit token error',
          'No access token found in token data'
        );
      onUpdateTokens(tokenData);
      // we have a problem with code identifier and social auth provider state
      // sense we want them be presictent in the browser for the redirection
      // functionality
      // but for the popup case, the states don't have a change to change, so they
      // stay at the initial state. I fixed the code verifier by generating one at
      // first before we start the auth flow. but for the social auth provider,
      // I find this solution to be a hacky one,
      // TODO: find a better solution for this
      setSocialAuthProvider(s => {
        onAuthenticate(s as unknown as DiditAuthMethod);
        return socialAuthProvider || s || '';
      });
      removeSocialAuthProvider();
      removeCodeVerifier();
    },
    [
      setSocialAuthProvider,
      handleTokenError,
      onAuthenticate,
      socialAuthProvider,
      removeSocialAuthProvider,
      removeCodeVerifier,
      onUpdateTokens,
    ]
  );

  const getDiditToken = useCallback(
    async (_authorizationCode: string, _codeVerifier: string) => {
      const tokenUrl = `${DIDIT.EMAIL_AUTH_BASE_URL}/oidc/token/`;

      const tokenBody = new URLSearchParams();
      tokenBody.append('client_id', clientId);
      tokenBody.append('code', _authorizationCode);
      tokenBody.append('code_verifier', _codeVerifier);
      tokenBody.append('grant_type', 'authorization_code');
      tokenBody.append('redirect_uri', `http://localhost:3000/callback`);
      try {
        const tokenData = await fetch(tokenUrl, {
          body: tokenBody,
          method: 'POST',
        })
          .then(response => response.json())
          .catch(error =>
            handleTokenError('Error retrieving Didit token', String(error))
          );

        handleTokenSuccess(tokenData);
        return tokenData;
      } catch (error) {
        handleTokenError('Error retrieving Didit token', String(error));
      }
    },
    [clientId, handleTokenError, handleTokenSuccess]
  );

  const getParamasAndAuthenticate = useCallback(
    (windowLocation: Location, isPopup: boolean = false) => {
      if (!windowLocation.search) {
        handleTokenError(
          'Error getting authorization code',
          'No search params found'
        );
        return;
      }
      const urlSearchParams = new URLSearchParams(windowLocation.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const _authorizationCode = params?.code;
      const authorizationError = params?.error;
      const authorizationErrorDescription = params?.error_description;

      if (_authorizationCode && !token && codeVerifier) {
        if (!isPopup) {
          urlSearchParams.delete('code');
          window.history.replaceState({}, '', `${windowLocation.pathname}`);
        }
        // Request the Didit token
        getDiditToken(_authorizationCode, codeVerifier);
      } else if (authorizationError) {
        if (!isPopup) {
          urlSearchParams.delete('error');
          urlSearchParams.delete('error_description');
          window.history.replaceState({}, '', `${windowLocation.pathname}`);
        }
        handleTokenError(authorizationError, authorizationErrorDescription);
      }
    },
    [token, codeVerifier, getDiditToken, handleTokenError]
  );

  const generateAuthorizeWithUrl = useCallback(
    async (_socialAuthProvider: SocialAuthProvider) => {
      // Force login when trying to login with a different method
      if (authMethod !== (_socialAuthProvider as unknown as DiditAuthMethod)) {
        onDeauthenticate();
      }

      // Configure the Didit auth popup
      const authorizationUrl = `${DIDIT.EMAIL_AUTH_BASE_URL}${DIDIT.EMAIL_AUTH_AUTHORIZATION_PATH}`;
      const codeChallengeMethod = DIDIT.EMAIL_AUTH_CODE_CHALLENGE_METHOD;
      const responseType = DIDIT.EMAIL_AUTH_RESPONSE_TYPE;
      const idp = _socialAuthProvider;
      setSocialAuthProvider(_socialAuthProvider);
      const encodedRedirectUrl = encodeURIComponent(redirectUri);

      // Generate a random string as code_verifier and code_challenge, and store the code_verifier in local storage
      const codeChallenge = await generateCodeChallenge(codeVerifier as string);

      // Generate the authorization url
      const authorizeUrl = `${authorizationUrl}?client_id=${clientId}&response_type=${responseType}&scope=${scope}&claims=${claims}&redirect_uri=${encodedRedirectUrl}&code_verifier=${codeVerifier}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}&idp=${idp}`;

      return authorizeUrl;
    },
    [
      authMethod,
      setSocialAuthProvider,
      redirectUri,
      clientId,
      scope,
      claims,
      codeVerifier,
      onDeauthenticate,
    ]
  );

  const authorizeDiditOnRedirectMode = (_authorizationUrl: string) => {
    // Redirect the user to the authorization URL
    window.location.href = _authorizationUrl;
  };

  const getSearchFromPopup = useCallback(
    (windowPopup: Window) => {
      function getSearchFromRedirection(popup: Window) {
        if (popup.document.domain === document.domain) {
          if (popup.document.readyState === 'complete') {
            clearInterval(interval);
            getParamasAndAuthenticate(popup.location, true);
            popup.close();
          }
        }
      }

      const interval = setInterval(function () {
        try {
          getSearchFromRedirection(windowPopup);
        } catch (e) {
          // we're here when the childPopup window has been closed
          if (windowPopup.closed) {
            clearInterval(interval);
            handleTokenError('Error Popup is closed', 'Connection Rejected');
          }
        }
      }, 500);
    },
    [getParamasAndAuthenticate, handleTokenError]
  );

  const authorizeDiditOnPopupMode = useCallback(
    (_authorizationUrl: string) => {
      // Open a pop-up centered in the middle of the screen instead of redirecting
      const width = DIDIT.EMAIL_AUTH_POPUP_WIDTH;
      const height = DIDIT.EMAIL_AUTH_POPUP_HEIGHT;

      // Recalculate the left and top positions just before opening the popup
      const left = window.innerWidth / 2 - width / 2 + window.screenX;
      const top = window.innerHeight / 2 - height / 2 + window.screenY;
      var popupReference = window.open(
        _authorizationUrl,
        'Authorization-Popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      if (!popupReference) {
        handleTokenError('Error retrieving Didit token', 'Cant open Popup');
        return;
      }
      getSearchFromPopup(popupReference);
    },
    [getSearchFromPopup, handleTokenError]
  );

  const loginWithSocial = useCallback(
    async (socialAuthProvider: SocialAuthProvider) => {
      const authorizationUrl = await generateAuthorizeWithUrl(
        socialAuthProvider
      );
      onUpdateAuthMethod(socialAuthProvider as unknown as DiditAuthMethod);

      if (emailAuthMode === DiditEmailAuthMode.POPUP)
        authorizeDiditOnPopupMode(authorizationUrl);
      if (emailAuthMode === DiditEmailAuthMode.REDIRECT)
        authorizeDiditOnRedirectMode(authorizationUrl);
    },
    [
      generateAuthorizeWithUrl,
      onUpdateAuthMethod,
      emailAuthMode,
      authorizeDiditOnPopupMode,
    ]
  );

  const loginWithGoogle = useCallback(
    () => loginWithSocial(SocialAuthProvider.GOOGLE),
    [loginWithSocial]
  );

  const loginWithApple = useCallback(
    () => loginWithSocial(SocialAuthProvider.APPLE),
    [loginWithSocial]
  );

  const loginWithEmail = useCallback(
    () => console.warn("NotImplementedError: Email login isn't supported yet"),
    []
  );

  // now we are either on a opopup or on the redirect url
  // if we are on the popup we should do nothing, the parent window will get the code from the url
  // if we are on the redirect url, we need to check if we have the code ...

  useEffect(() => {
    // first check if we are on popup to do nothing
    if (
      typeof window === 'undefined' ||
      (window.opener &&
        window.opener !== window &&
        window.name === 'Authorization-Popup')
    )
      return;
    else {
      // first check if we are on the redirect url
      const windowLocation = window.location;
      const windowUrl = windowLocation.origin + windowLocation.pathname;
      if (windowUrl !== redirectUri || !windowLocation.search) return;
      getParamasAndAuthenticate(windowLocation);
    }
  }, [redirectUri, getParamasAndAuthenticate]);

  const contextValue = useMemo(
    () => ({
      error,
      loginWithApple,
      loginWithEmail,
      loginWithGoogle,
      loginWithSocial,
      status,
      token,
    }),
    [
      token,
      status,
      error,
      loginWithSocial,
      loginWithGoogle,
      loginWithApple,
      loginWithEmail,
    ]
  );

  return (
    <DiditEmailAuthContext.Provider value={contextValue}>
      {children}
    </DiditEmailAuthContext.Provider>
  );
};

export default DiditEmailAuthProvider;
