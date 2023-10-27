import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DIDIT } from '../../config';
import {
  AuthenticationStatus,
  DiditAuthMethod,
  SocialAuthProvider,
} from '../../types';
import { generateCodeChallenge, generateCodeVerifier } from '../../utils';
import { DiditEmailAuthContext } from './diditEmailAuthContext';

interface DiditTokenData {
  access_token: string;
}

interface DiditEmailAuthProviderProps {
  authMethod?: DiditAuthMethod;
  children: React.ReactNode;
  claims: string;
  clientId: string;
  emailAuthBaseUrl?: string;
  emailAuthorizationPath?: string;
  emailRedirectionPath?: string;
  error?: string;
  onAuthenticate?: (_authMethod: DiditAuthMethod) => void;
  onDeauthenticate?: () => void;
  onError?: (error: string) => void;
  onUpdateToken?: (token: string) => void;
  scope: string;
  status: AuthenticationStatus;
  token?: string;
}

const DiditEmailAuthProvider = ({
  authMethod = undefined,
  children,
  claims = '',
  clientId,
  emailAuthBaseUrl = DIDIT.DEFAULT_EMAIL_AUTH_BASE_URL,
  emailAuthorizationPath = DIDIT.DEFAULT_EMAIL_AUTH_AUTHORIZATION_PATH,
  emailRedirectionPath = DIDIT.DEFAULT_EMAIL_AUTH_REDIRECT_URI_PATH,
  error,
  onAuthenticate = () => {},
  onDeauthenticate = () => {},
  onError = () => {},
  onUpdateToken = () => {},
  scope,
  status,
  token,
}: DiditEmailAuthProviderProps) => {
  // Create the Didit auth popup and broadcast channel to communicate with auth popup
  const [diditAuthPopup, setDiditEmailAuthPopup] = useState<Window | null>(
    null
  );
  const [initMessageInterval, setInitMessageInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [socialAuthProvider, setSocialAuthProvider] =
    useState<SocialAuthProvider>();

  const handleTokenSuccess = useCallback(
    (tokenData: DiditTokenData) => {
      onUpdateToken(tokenData?.access_token);
      onAuthenticate(socialAuthProvider as unknown as DiditAuthMethod);
    },
    [onUpdateToken, onAuthenticate, socialAuthProvider]
  );

  const handleTokenError = useCallback(
    (_error: string, _errorDescription: string) => {
      diditAuthPopup?.close();
      console.error(_error, _errorDescription);
      onError(_error);
      onDeauthenticate();
      setSocialAuthProvider(undefined);
    },
    [diditAuthPopup, onError, onDeauthenticate]
  );

  const handleReceiveMessage = useCallback(
    (event: MessageEvent) => {
      const diditOrigin = new URL(emailAuthBaseUrl).origin;

      if (event.origin.replace(/\/$/, '') !== diditOrigin.replace(/\/$/, ''))
        return;

      // Access the data sent in the message
      const messageData = event?.data;

      // Check if the message is an init response message
      if (messageData?.type === DIDIT.EMAIL_AUTH_INIT_POST_MESSAGE_TYPE) {
        // Clear the init message interval
        if (initMessageInterval) clearInterval(initMessageInterval);
      }

      // Check if the message is a Didit token
      if (
        messageData?.type === DIDIT.EMAIL_AUTH_TOKEN_POST_MESSAGE_TYPE &&
        messageData?.data
      ) {
        // Handle didit token message
        handleTokenSuccess(messageData?.data);
      } else if (
        messageData?.type === DIDIT.EMAIL_AUTH_TOKEN_POST_MESSAGE_ERROR_TYPE &&
        messageData?.error
      ) {
        // Handle error message
        handleTokenError(messageData?.error, messageData?.error_description);
      }
    },
    [
      emailAuthBaseUrl,
      initMessageInterval,
      handleTokenSuccess,
      handleTokenError,
    ]
  );

  // Init communication with Didit popup window
  const startInitMessageInterval = useCallback(
    (_popup: Window) => {
      const diditOrigin = new URL(emailAuthBaseUrl).origin;
      const _initMessageInterval = setInterval(() => {
        _popup?.postMessage(
          {
            type: DIDIT.EMAIL_AUTH_INIT_POST_MESSAGE_TYPE,
          },
          diditOrigin
        );
      }, 1000);
      setInitMessageInterval(_initMessageInterval);
    },
    [emailAuthBaseUrl, setInitMessageInterval]
  );

  const generateSocialAuthUrl = useCallback(
    async (socialAuthProvider: SocialAuthProvider) => {
      // Force login when trying to login with a different method
      if (authMethod !== (socialAuthProvider as unknown as DiditAuthMethod)) {
        onDeauthenticate();
      }

      // Configure the Didit auth popup
      const authorizationUrl = `${emailAuthBaseUrl}${emailAuthorizationPath}`;
      const redirectUri = `${emailAuthBaseUrl}${emailRedirectionPath}`;
      const codeChallengeMethod = DIDIT.EMAIL_AUTH_CODE_CHALLENGE_METHOD;
      const responseType = DIDIT.EMAIL_AUTH_RESPONSE_TYPE;
      const idp = socialAuthProvider;
      const encodedRedirectUrl = encodeURIComponent(redirectUri);
      setSocialAuthProvider(socialAuthProvider);

      // Generate a random string as code_verifier and code_challenge, and store the code_verifier in local storage
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Generate the authorization url
      const authorizeUrl = `${authorizationUrl}?client_id=${clientId}&response_type=${responseType}&scope=${scope}&claims=${claims}&redirect_uri=${encodedRedirectUrl}&code_verifier=${codeVerifier}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}&idp=${idp}`;
      return authorizeUrl;
    },
    [
      authMethod,
      emailAuthBaseUrl,
      clientId,
      scope,
      claims,
      onDeauthenticate,
      emailAuthorizationPath,
      emailRedirectionPath,
    ]
  );

  const loginWithSocial = useCallback(
    (socialAuthProvider: SocialAuthProvider) => {
      // Open a pop-up centered in the middle of the screen instead of redirecting
      const width = DIDIT.EMAIL_AUTH_POPUP_WIDTH;
      const height = DIDIT.EMAIL_AUTH_POPUP_HEIGHT;

      // Recalculate the left and top positions just before opening the popup
      const left = window.innerWidth / 2 - width / 2 + window.screenX;
      const top = window.innerHeight / 2 - height / 2 + window.screenY;
      var popupReference = window.open(
        '',
        'Authorization',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      if (popupReference) {
        generateSocialAuthUrl(socialAuthProvider).then(authorizeUrl => {
          // update popup url
          if (popupReference) {
            popupReference.location = authorizeUrl;
            setDiditEmailAuthPopup(popupReference);
            startInitMessageInterval(popupReference);
          }
        });
      }
    },
    [generateSocialAuthUrl, startInitMessageInterval]
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

  useEffect(() => {
    window.addEventListener('message', handleReceiveMessage, false);

    // Clean up the window function when the component unmounts
    return () => {
      window.removeEventListener('message', handleReceiveMessage);
      if (initMessageInterval) clearInterval(initMessageInterval);
    };
  }, [
    initMessageInterval,
    handleTokenSuccess,
    handleTokenError,
    handleReceiveMessage,
  ]);

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
