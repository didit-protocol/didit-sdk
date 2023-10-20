import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useAccount, useDisconnect } from 'wagmi';
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '../../components/RainbowKitProvider/AuthenticationContext';
import { DIDIT } from '../../config';
import { AuthenticationStatus, DiditAuthMethod } from '../../types';

interface DiditWalletProviderProps {
  authMethod?: DiditAuthMethod;
  baseUrl: string;
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
}

export function DiditWalletProvider({
  authMethod = undefined,
  baseUrl,
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
}: DiditWalletProviderProps) {
  const wagmiAccount = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_walletAddress, setWalletddress] = useLocalStorage<string>(
    DIDIT.WALLET_ADDRESS_COOKIE_NAME,
    ''
  );

  const [address, setAddress] = useState(wagmiAccount?.address ?? undefined);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!address && wagmiAccount.address) {
      setAddress(wagmiAccount.address);
    } else if (address && wagmiAccount.address) {
      if (address !== wagmiAccount.address) {
        adapter.signOut();
        setAddress(wagmiAccount.address);
      }
    } else {
      adapter.signOut();
      setAddress(undefined);
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
          const endpoint = `${baseUrl}${DIDIT.AUTH_WALLET_AUTHORIZATION_PATH}`;
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
          onError('');
          setAddress(undefined);
        },

        verify: async ({ code, signature }) => {
          const endpoint = `${baseUrl}${DIDIT.AUTH_TOKEN_PATH}`;
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
    if (response.status === 200) {
      return response.json();
    } else {
      const responseObj = await response.json();
      onError(responseObj);
      throw new Error(responseObj);
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
