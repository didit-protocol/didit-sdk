import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { DIDIT } from '../../config';
import { SocialAuthProvider } from '../../types';
import { generateCodeChallenge, generateCodeVerifier } from '../../utils';
import { DiditEmailAuthContext } from './diditEmailAuthContext';

interface DiditTokenData {
  access_token: string;
}

interface DiditEmailAuthProviderProps {
  baseUrl?: string;
  children: React.ReactNode;
  clientId: string;
  claims?: string;
}

const DiditEmailAuthProvider = ({
  baseUrl = DIDIT.EMAIL_AUTH_DEFAULT_BASE_URL,
  children,
  claims = '',
  clientId,
}: DiditEmailAuthProviderProps) => {
  // Create the Didit auth popup and broadcast channel to communicate with auth popup
  const [diditAuthPopup, setDiditAuthPopup] = useState<Window | null>(null);
  const [initMessageInterval, setInitMessageInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Store the Didit token in local storage
  const [token, setToken] = useLocalStorage<string>(
    DIDIT.TOKEN_COOKIE_NAME,
    ''
  );

  const handleTokenSuccess = useCallback(
    (tokenData: DiditTokenData) => {
      setToken(tokenData?.access_token);
    },
    [setToken]
  );

  const handleTokenError = useCallback(
    (_error: string, _errorDescription: string) => {
      diditAuthPopup?.close();
    },
    [diditAuthPopup]
  );

  const handleReceiveMessage = useCallback(
    (event: MessageEvent) => {
      const diditOrigin = new URL(baseUrl).origin;

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
        messageData?.data
      ) {
        // Handle error message
        if (messageData?.data)
          handleTokenError(
            messageData?.data?.error,
            messageData?.data?.error_description
          );
      }
    },
    [baseUrl, initMessageInterval, handleTokenSuccess, handleTokenError]
  );

  // Init communication with Didit popup window
  const startInitMessageInterval = useCallback(
    (_popup: Window) => {
      const diditOrigin = new URL(baseUrl).origin;
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
    [baseUrl, setInitMessageInterval]
  );

  const socialLogin = useCallback(
    async (socialAuthProvider: SocialAuthProvider) => {
      // Configure the Didit auth popup
      const authorizationUrl = `${baseUrl}${DIDIT.EMAIL_AUTH_AUTHORIZATION_PATH}`;
      const redirectUri = `${baseUrl}${DIDIT.EMAIL_AUTH_REDIRECT_URI_PATH}`;
      const codeChallengeMethod = DIDIT.EMAIL_AUTH_CODE_CHALLENGE_METHOD;
      const responseType = DIDIT.EMAIL_AUTH_RESPONSE_TYPE;
      const scope = DIDIT.EMAIL_AUTH_SCOPE;
      const idp = socialAuthProvider;
      const encodedRedirectUrl = encodeURIComponent(redirectUri);

      // Generate a random string as code_verifier and code_challenge, and store the code_verifier in local storage
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // Generate the authorization url
      const authorizeUrl = `${authorizationUrl}?client_id=${clientId}&response_type=${responseType}&scope=${scope}&claims=${claims}&redirect_uri=${encodedRedirectUrl}&code_verifier=${codeVerifier}&code_challenge=${codeChallenge}&code_challenge_method=${codeChallengeMethod}&idp=${idp}`;

      // Open a pop-up centered in the middle of the screen instead of redirecting
      const width = DIDIT.EMAIL_AUTH_POPUP_WIDTH;
      const height = DIDIT.EMAIL_AUTH_POPUP_HEIGHT;

      // Recalculate the left and top positions just before opening the popup
      const left = window.innerWidth / 2 - width / 2 + window.screenX;
      const top = window.innerHeight / 2 - height / 2 + window.screenY;

      // Open the popup window
      const _diditPopup = window.open(
        authorizeUrl,
        'Authentication',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      setDiditAuthPopup(_diditPopup);

      if (_diditPopup) startInitMessageInterval(_diditPopup);
    },
    [baseUrl, clientId, claims, startInitMessageInterval]
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

  const logout = useCallback(() => {
    setToken('');
  }, [setToken]);

  const contextValue = useMemo(
    () => ({
      login: socialLogin,
      logout,
      token,
    }),
    [token, socialLogin, logout]
  );

  return (
    <DiditEmailAuthContext.Provider value={contextValue}>
      {children}
    </DiditEmailAuthContext.Provider>
  );
};

export default DiditEmailAuthProvider;
