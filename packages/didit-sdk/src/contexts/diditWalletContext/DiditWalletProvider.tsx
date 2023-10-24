import { useLocalStorageValue } from '@react-hookz/web';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '../../components/RainbowKitProvider/AuthenticationContext';
import { DIDIT } from '../../config';
import { AuthenticationStatus, DiditAuthMethod } from '../../types';

interface DiditWalletProviderProps {
  authMethod?: DiditAuthMethod;
  children: ReactNode;
  claims: string;
  enabled?: boolean;
  error?: string;
  onAuthenticate?: (_authMethod: DiditAuthMethod) => void;
  onDeauthenticate?: () => void;
  onError?: (error: string) => void;
  onUpdateToken?: (token: string) => void;
  scope: string;
  status?: AuthenticationStatus;
  token?: string;
  tokenAuthorizationPath?: string;
  walletAuthBaseUrl?: string;
  walletAuthorizationPath?: string;
}

export function DiditWalletProvider({
  authMethod = undefined,
  children,
  claims,
  enabled,
  error = '',
  onAuthenticate = () => {},
  onDeauthenticate = () => {},
  onError = () => {},
  onUpdateToken = () => {},
  scope,
  status = AuthenticationStatus.LOADING,
  token = '',
  tokenAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_TOKEN_PATH,
  walletAuthBaseUrl = DIDIT.DEFAULT_WALLET_AUTH_BASE_URL,
  walletAuthorizationPath = DIDIT.DEFAULT_WALLET_AUTH_AUTHORIZATION_PATH,
}: DiditWalletProviderProps) {
  const wagmiAccount = useAccount();

  const { remove: removeWalletaddress, set: setWalletddress } =
    useLocalStorageValue<string>(DIDIT.WALLET_ADDRESS_COOKIE_NAME, {
      initializeWithValue: false,
    });

  const [address, setAddress] = useState(wagmiAccount?.address ?? undefined);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (authMethod !== DiditAuthMethod.WALLET) return;

    if (!address && wagmiAccount.address) {
      setAddress(wagmiAccount.address);
      setWalletddress(wagmiAccount.address);
    } else if (address && wagmiAccount.address) {
      if (address !== wagmiAccount.address) {
        setAddress(wagmiAccount.address);
        setWalletddress(wagmiAccount.address);
      }
    } else {
      setAddress(undefined);
      removeWalletaddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagmiAccount.address, address]);

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address }) => {
          // Force login when trying to login with a different method
          if (authMethod !== DiditAuthMethod.WALLET) {
            onDeauthenticate();
          }

          const parameters = walletAuthPayload(address, claims, scope);
          const endpoint = `${walletAuthBaseUrl}${walletAuthorizationPath}`;
          try {
            var { code, policy } = await postRequest(endpoint, parameters);
            setWalletddress(address);
          } catch (walletAuthError) {
            throw walletAuthError;
          }
          return { code, policy };
        },

        getMessageBody: ({ message }) => message,

        getNonce: async () => {
          return 'ThisIsNotUsed';
        },

        signOut: async () => {
          onDeauthenticate();
          disconnect();
          setAddress(undefined);
        },

        verify: async ({ code, signature }) => {
          const endpoint = `${walletAuthBaseUrl}${tokenAuthorizationPath}`;
          const parameters = `code=${code}&wallet_signature=${signature}&grant_type=connect_wallet`;
          try {
            var { access_token } = await postRequest(endpoint, parameters);
            onUpdateToken(access_token);
          } catch (tokenError) {
            throw tokenError;
          }
          if (access_token) {
            onAuthenticate(DiditAuthMethod.WALLET);
            onUpdateToken(access_token);
          } else {
            throw new Error('Something went wrong, try again please!');
          }
          return true;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function walletAuthPayload(address: string, claims = '', scope = '') {
    var encodedKey;
    var encodedValue;
    const data: { [key: string]: any } = {
      claims,
      scope,
      wallet_address: address,
    };
    var formBody: string[] = Object.entries(data).map(([key, val]) => {
      encodedKey = encodeURIComponent(key);
      encodedValue = encodeURIComponent(val);
      return encodedKey + '=' + encodedValue;
    });
    const formBodyJoined = formBody.join('&');
    return formBodyJoined;
  }

  async function postRequest(endpoint: string, formBodyJoined: string) {
    const response = await fetch(`${endpoint}`, {
      body: formBodyJoined,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      method: 'POST',
    });
    if (response.ok) {
      // Handle successful response here
      return await response.json();
    } else {
      const errorData = await response.json();
      if (typeof errorData === 'string') {
        onError(errorData);
        throw new Error(errorData);
      } else {
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          errorData?.details ||
          'Unknown error';
        onError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  }

  return (
    <RainbowKitAuthenticationProvider
      adapter={adapter}
      address={address}
      enabled={enabled}
      error={error}
      status={status}
      token={token}
    >
      {children}
    </RainbowKitAuthenticationProvider>
  );
}
