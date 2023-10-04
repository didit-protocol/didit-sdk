import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from 'didit-sdk';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useAccount, useDisconnect } from 'wagmi';

interface DiditProviderProps {
  enabled?: boolean;
  children: ReactNode;
  clientUrl: string;
}

export function DiditProvider({
  children,
  clientUrl,
  enabled,
}: DiditProviderProps) {
  const wagmiAccount = useAccount();
  const tokenTemp = getLocalStorage();
  const STATUS_INIT = 'loading';

  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >(STATUS_INIT);
  const [token, setToken] = useState(tokenTemp);
  const [address, setAddress] = useState(wagmiAccount?.address ?? undefined);
  const [error, setError] = useState('');
  const { disconnect } = useDisconnect();

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
          const parameters = walletAuthPayload(address);
          const endpoint = `${clientUrl}/wallet-authorization`;
          try {
            var { code, policy } = await postRequest(endpoint, parameters);
            window.localStorage.setItem(`_gamium_address`, address);
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
          setToken(false);
          disconnect();
          setError('');
          window.localStorage.removeItem(`_gamium_token_`);
          window.localStorage.removeItem(`_gamium_address`);
        },

        verify: async ({ code, signature }) => {
          const endpoint = `${clientUrl}/token`;
          const parameters = `code=${code}&wallet_signature=${signature}`;
          try {
            var { access_token } = await postRequest(endpoint, parameters);
            window.localStorage.setItem(`_gamium_token_`, access_token);
          } catch (tokenError) {
            throw tokenError;
          }
          if (access_token) {
            setStatus('authenticated');
            setToken(access_token);
          } else {
            throw new Error('Something went wrong, try again please!');
          }
          return true;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function walletAuthPayload(address: string) {
    var encodedKey;
    var encodedValue;
    const data: { [key: string]: any } = {
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
      setError(responseObj);
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
function getLocalStorage() {
  const token = window.localStorage.getItem(`_gamium_token_`);
  if (token) {
    const token_info = parseJwt(token);
    if (token_info.exp * 1000 < Date.now()) {
      return false;
    }
    return token;
  } else {
    return false;
  }
}

function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}
