import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from 'diditsdktest';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useAccount } from 'wagmi';

interface DiditProviderProps {
  enabled?: boolean;
  children: ReactNode;
  claims?: string;
  client_id: string;
  scopes: string;
}

export function DiditProvider({
  children,
  claims,
  client_id,
  enabled,
  scopes,
}: DiditProviderProps) {
  const wagmiAccount = useAccount();
  const tokenTemp = getLocalStorage();
  const STATUS_INIT = 'loading';

  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >(STATUS_INIT);
  const [token, setToken] = useState(tokenTemp);
  const [address, setAddress] = useState(wagmiAccount?.address);

  useEffect(() => {
    if (address && token) {
      setStatus('authenticated');
    } else {
      setStatus('unauthenticated');
    }
  }, [address, token]);
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.localStorage.removeItem(`_gamium_token_`);
      setToken(false);
    }
  }, [status]);
  useEffect(() => {
    if (wagmiAccount.address) {
      setAddress(wagmiAccount.address);
    } else {
      setAddress(false);
    }
  }, [wagmiAccount]);

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address }) => {
          const parameters = walletAuthPayload(address);
          const endpoint = `${client_id}/wallet_authorization`;
          try {
            var { code, policy } = await postRequest(endpoint, parameters);
            window.localStorage.setItem(`_gamium_address`, address);
          } catch (error) {
            throw new Error('Error when accessing wallet authorization');
          }
          return { code, policy };
        },

        getMessageBody: ({ message }) => message,

        getNonce: async () => {
          return 'ThisIsNotUsed';
        },

        signOut: async () => {
          setToken(false);
          window.localStorage.removeItem(`_gamium_token_`);
          window.localStorage.removeItem(`_gamium_address`);
        },

        verify: async ({ code, signature }) => {
          const endpoint = `${client_id}/token`;
          const parameters = `code=${code}&wallet_signature=${signature}`;
          try {
            var { access_token } = await postRequest(endpoint, parameters);
            setStatus('authenticated');
            window.localStorage.setItem(`_gamium_token_`, access_token);
          } catch (error) {
            throw new Error('Error when accessing token');
          }
          setToken(access_token);
          return true;
        },
      }),
    []
  );

  function walletAuthPayload(address: string) {
    var encodedKey;
    var encodedValue;
    const data: { [key: string]: any } = {
      claims,
      scope: scopes,
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
    return response.json();
  }

  return (
    <RainbowKitAuthenticationProvider
      adapter={adapter}
      address={address}
      enabled={enabled}
      status={status}
      token={token}
    >
      {children}
    </RainbowKitAuthenticationProvider>
  );
}
function getLocalStorage() {
  const token = window.localStorage.getItem(`_gamium_token_`);
  if (token) {
    return token;
  } else {
    return false;
  }
}
