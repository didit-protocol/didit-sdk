import { useLocalStorageValue } from '@react-hookz/web';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DIDIT } from '../../config';
import {
  DiditAuthMethod,
  DiditAuthStatus,
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
  emailAuthBaseUrl?: string;
  error?: string;
  onAuthenticate?: (_authMethod: DiditAuthMethod) => void;
  onDeauthenticate?: () => void;
  onError?: (error: string) => void;
  onUpdateTokens?: (tokens: DiditTokensData) => void;
  onUpdateAuthMethod?: (authMethod: DiditAuthMethod) => void;
  redirectUri: string;
  scope: string;
  status: DiditAuthStatus;
  token?: string;
}

const DiditEmailAuthProvider = ({
  authMethod = undefined,
  children,
  claims = '',
  clientId,
  emailAuthBaseUrl = DIDIT.DEFAULT_EMAIL_AUTH_BASE_URL,
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
  // Sanitize window values. Window reference is not available in SSR (nextjs)
  const isPopupWindow = typeof window !== 'undefined' && !!window?.opener;

  const windowLocation =
    typeof window !== 'undefined'
      ? window?.location
      : {
          href: '',
          origin: '',
          pathname: '',
          search: '',
        };

  const isRedirectUrl = useMemo(() => {
    const windowUrl = windowLocation?.origin + windowLocation?.pathname;
    const _redirectUri = new URL(redirectUri);
    const redirectUrl = _redirectUri?.origin + _redirectUri?.pathname;
    return windowUrl.replace(/\/$/, '') === redirectUrl.replace(/\/$/, '');
  }, [redirectUri, windowLocation?.origin, windowLocation?.pathname]);

  // Create the Didit auth popup
  const [diditAuthPopup, setDiditEmailAuthPopup] = useState<Window | null>(
    null
  );

  const {
    remove: removeCodeVerifier,
    set: setCodeVerifier,
    value: codeVerifier,
  } = useLocalStorageValue<string>(DIDIT.EMAIL_AUTH_CODE_VERIFIER_COOKIE_NAME, {
    defaultValue: '',
    initializeWithValue: false,
  });

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
      diditAuthPopup?.close();
      onError(_error);
      onDeauthenticate();
      removeSocialAuthProvider();
      removeCodeVerifier();
    },
    [
      diditAuthPopup,
      onError,
      onDeauthenticate,
      removeCodeVerifier,
      removeSocialAuthProvider,
    ]
  );

  const handleTokenSuccess = useCallback(
    (tokenData: DiditTokensData) => {
      if (!tokenData?.access_token)
        handleTokenError(
          'Didit token error',
          'No access token found in token data'
        );
      onUpdateTokens(tokenData);
      onAuthenticate(socialAuthProvider as unknown as DiditAuthMethod);
      removeSocialAuthProvider();
      removeCodeVerifier();
    },
    [
      handleTokenError,
      onAuthenticate,
      socialAuthProvider,
      removeSocialAuthProvider,
      removeCodeVerifier,
      onUpdateTokens,
    ]
  );

  const generateAuthorizeWithUrl = useCallback(
    async (_socialAuthProvider: SocialAuthProvider) => {
      // Force login when trying to login with a different method
      if (authMethod !== (_socialAuthProvider as unknown as DiditAuthMethod)) {
        onDeauthenticate();
      }

      // Configure the Didit auth popup
      const authorizationUrl = `${emailAuthBaseUrl}${DIDIT.EMAIL_AUTH_AUTHORIZATION_PATH}`;
      const codeChallengeMethod = DIDIT.EMAIL_AUTH_CODE_CHALLENGE_METHOD;
      const responseType = DIDIT.EMAIL_AUTH_RESPONSE_TYPE;
      const idp = _socialAuthProvider;
      setSocialAuthProvider(_socialAuthProvider);

      // Generate a random string as code_verifier and code_challenge, and store the code_verifier in local storage
      const _codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(_codeVerifier);
      setCodeVerifier(_codeVerifier);

      const params = new URLSearchParams({
        claims,
        client_id: clientId,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        code_verifier: _codeVerifier,
        idp,
        redirect_uri: redirectUri,
        response_type: responseType,
        scope,
      });

      // Generate the authorization url
      const authorizeUrl = `${authorizationUrl}?${params.toString()}`;

      // Generate the authorization url
      return authorizeUrl;
    },
    [
      authMethod,
      emailAuthBaseUrl,
      setSocialAuthProvider,
      redirectUri,
      setCodeVerifier,
      clientId,
      scope,
      claims,
      onDeauthenticate,
    ]
  );

  const authorizeDiditOnRedirectMode = (_authorizationUrl: string) => {
    // Redirect the user to the authorization URL
    window.location.href = _authorizationUrl;
  };

  const authorizeDiditOnPopupMode = useCallback((_authorizationUrl: string) => {
    // Open a pop-up centered in the middle of the screen instead of redirecting
    const width = DIDIT.EMAIL_AUTH_POPUP_WIDTH;
    const height = DIDIT.EMAIL_AUTH_POPUP_HEIGHT;

    // Recalculate the left and top positions just before opening the popup
    const left = window.innerWidth / 2 - width / 2 + window.screenX;
    const top = window.innerHeight / 2 - height / 2 + window.screenY;
    const popupReference = window.open(
      '',
      'Authorization',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    if (popupReference) {
      // update popup url
      if (popupReference) {
        popupReference.location = _authorizationUrl;
        setDiditEmailAuthPopup(popupReference);
      }
    }
  }, []);

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

  const getDiditToken = useCallback(
    async (_authorizationCode: string, _codeVerifier: string) => {
      const tokenUrl = `${emailAuthBaseUrl}${DIDIT.EMAIL_AUTH_TOKEN_PATH}`;
      const tokenBody = new URLSearchParams();
      tokenBody.append('client_id', clientId);
      tokenBody.append('code', _authorizationCode);
      tokenBody.append('code_verifier', _codeVerifier);
      tokenBody.append('grant_type', 'authorization_code');
      tokenBody.append('redirect_uri', redirectUri);

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
    [
      clientId,
      emailAuthBaseUrl,
      handleTokenError,
      handleTokenSuccess,
      redirectUri,
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

  // Effect to request the Didit token when the authorization code is present in the URL
  const requestDiditAccessToken = useCallback(async () => {
    const urlSearchParams = new URLSearchParams(windowLocation.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const _authorizationCode = params?.code;
    const authorizationError = params?.error;
    const authorizationErrorDescription = params?.error_description;

    if (_authorizationCode && !token && codeVerifier) {
      urlSearchParams.delete('code');
      window.history.replaceState({}, '', `${windowLocation.pathname}`);

      // Request the Didit token
      await getDiditToken(_authorizationCode, codeVerifier);

      // Close the popup when the token is retrieved
      window.close();
    } else if (authorizationError) {
      urlSearchParams.delete('error');
      urlSearchParams.delete('error_description');
      window.history.replaceState({}, '', `${windowLocation.pathname}`);

      handleTokenError(authorizationError, authorizationErrorDescription);
    }
  }, [
    windowLocation.search,
    windowLocation.pathname,
    token,
    codeVerifier,
    getDiditToken,
    handleTokenError,
  ]);

  // Effect to propagate redirection from the popup to the parent window
  useEffect(() => {
    // If there is a parent window and redirect uri matches, we are in the popup
    // Request a token only when we have defined a new code verifier (avoid multiple token requests)
    if (isPopupWindow && isRedirectUrl && codeVerifier) {
      requestDiditAccessToken(); // Token request always happens in the popup window
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeVerifier]);

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
