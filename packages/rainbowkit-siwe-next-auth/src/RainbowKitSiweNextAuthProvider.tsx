import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from 'diditsdktest';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

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
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('unauthenticated');
  // TO CHANGE
  useEffect(() => {
    if (status === 'unauthenticated') {
      cleanLocalStorage();
    }
  }, [status]);
  const [token, setToken] = useState('');
  const [address, setAddress] = useState('');

  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address }) => {
          setAddress(address);
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
          setStatus('unauthenticated');
          setToken('');
          setAddress('');
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
function cleanLocalStorage() {
  window.localStorage.removeItem(`_gamium_token_`);
  window.localStorage.removeItem(`_gamium_address`);
}
