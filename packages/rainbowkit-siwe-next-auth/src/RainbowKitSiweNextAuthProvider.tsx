import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from 'diditsdktest';
import React, { ReactNode, useMemo, useState } from 'react';
import { SiweMessage } from 'siwe';

type UnconfigurableMessageOptions = {
  address: string;
  chainId: number;
  nonce: string;
};

type ConfigurableMessageOptions = Partial<
  Omit<SiweMessage, keyof UnconfigurableMessageOptions>
> & {
  [Key in keyof UnconfigurableMessageOptions]?: never;
};

export type GetSiweMessageOptions = () => ConfigurableMessageOptions;

interface DiditProviderProps {
  enabled?: boolean;
  getSiweMessageOptions?: GetSiweMessageOptions;
  children: ReactNode;
  client_id: string;
  scopes: string;
}

export function DiditProvider({
  children,
  client_id,
  enabled,
  getSiweMessageOptions,
  scopes,
}: DiditProviderProps) {
  const [status, setStatus] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('unauthenticated');
  const [token, setToken] = useState('');
  const [address, setAddress] = useState('');
  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address, chainId }) => {
          setAddress(address);
          const parameters = walletAuthPayload(address);
          const endpoint = `${client_id}/wallet_authorization`;
          try {
            var { application, code, expires_at, issued_at, nonce, policy } =
              await postRequest(endpoint, parameters);
          } catch (error) {
            throw new Error('Error when accessing wallet authorization');
          }
          return siweMessageToSign(
            policy,
            address,
            chainId,
            code,
            nonce,
            application,
            expires_at,
            issued_at
          );
        },

        getMessageBody: ({ message }) => message.prepareMessage(),

        getNonce: async () => {
          return 'dededeededed';
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
          } catch (error) {
            throw new Error('Error when accessing token');
          }
          setToken(access_token);
          return true;
        },
      }),
    [getSiweMessageOptions]
  );

  function siweMessageToSign(
    policy: string,
    address: string,
    chainId: number,
    code: any,
    nonce: any,
    application: string,
    expires_at: string,
    issued_at: string
  ) {
    const RESOURCE = 'https://gamimum.world';
    const VERSION = '1';
    const domain = application + ' on behalf of ' + RESOURCE;

    const defaultConfigurableOptions = {
      domain: domain,
      statement: policy,
      uri: RESOURCE,
      version: VERSION,
    };
    const unconfigurableOptions = {
      address,
      chainId,
      expirationTime: expires_at,
      issuedAt: issued_at,
      nonce,
      requestId: code,
    };

    const messageToSign = new SiweMessage({
      ...defaultConfigurableOptions,
      ...(getSiweMessageOptions == null ? void 0 : getSiweMessageOptions()),
      ...unconfigurableOptions,
    });
    return messageToSign;
  }

  function walletAuthPayload(address: string) {
    var formBody = [];
    var encodedKey = encodeURIComponent('scope');
    var encodedValue = encodeURIComponent(scopes);
    formBody.push(encodedKey + '=' + encodedValue);
    encodedKey = encodeURIComponent('wallet_address');
    encodedValue = encodeURIComponent(address);
    formBody.push(encodedKey + '=' + encodedValue);
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
