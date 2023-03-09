import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from 'diditgamiumsdk';
import { getCsrfToken, signOut, useSession } from 'next-auth/react';
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

interface RainbowKitSiweNextAuthProviderProps {
  enabled?: boolean;
  getSiweMessageOptions?: GetSiweMessageOptions;
  children: ReactNode;
  clientId: string;
  scopes: string;
}

export function RainbowKitSiweNextAuthProvider({
  children,
  clientId,
  enabled,
  getSiweMessageOptions,
  scopes,
}: RainbowKitSiweNextAuthProviderProps) {
  const [status, setStatus] = useState<
  'loading' | 'authenticated' | 'unauthenticated'
>('unauthenticated');
  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address, chainId }) => {
          const parameters = walletAuthPayload(address);
          const endpoint = `${clientId}/wallet_authorization`;
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
          return "isMandatoryButNotUsed";
        },

        signOut: async () => {
          await signOut({ redirect: false });
        },

        verify: async ({ code, signature }) => {
          const endpoint = `${clientId}/token`;
          const parameters = `code=${code}&wallet_signature=${signature}`;
          try {
            var { access_token } = await postRequest(endpoint, parameters);
            setStatus('authenticated')
          } catch (error) {
            throw new Error('Error when accessing token');
          }
          return { token: access_token, verified: true };
        },
      }),
    [getSiweMessageOptions]
  );

  return (
    <RainbowKitAuthenticationProvider
      adapter={adapter}
      clientId={clientId}
      enabled={enabled}
      scopes={scopes}
      status={status}
    >
      {children}
    </RainbowKitAuthenticationProvider>
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
    const data = {
      scope: scopes,
      wallet_address: address,
    };
    var formBody = [];
    var encodedKey = encodeURIComponent("scope");
    var encodedValue = encodeURIComponent(scopes);
    formBody.push(encodedKey + '=' + encodedValue);
    var encodedKey = encodeURIComponent('wallet_address');
    var encodedValue = encodeURIComponent(address);
    formBody.push(encodedKey + '=' + encodedValue);
    const formBodyJoined = formBody.join('&');
    return formBodyJoined;
  }
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
