import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import { getCsrfToken, signIn, signOut, useSession } from 'next-auth/react';
import React, { ReactNode, useMemo } from 'react';
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
  const { status } = useSession();
  const adapter = useMemo(
    () =>
      createAuthenticationAdapter({
        createMessage: async ({ address, chainId }) => {
          const parameters = walletAuthPayload(address);
          const endpoint = `${clientId}/oauth/wallet_authorization`;
          try {
              var { code, nonce, policy } = await postRequest(endpoint, parameters);
          } catch (error) {
            //throw new Error(`ClientId: ${clientId} or scopes: ${scopes} not valid`);
          }
            return siweMessageToSign(policy, address, chainId, code, nonce);
        },

        getMessageBody: ({ message }) => message.prepareMessage(),

        getNonce: async () => {
          const nonce = await getCsrfToken();
          if (!nonce) throw new Error();
          return nonce;
        },

        signOut: async () => {
          await signOut({ redirect: false });
        },

        verify: async ({ signature, code }) => {
          const endpoint = `${clientId}/token`;
          const parameters = `code=${code}&wallet_signature=${signature}`;
          try {
            var { access_token } = await postRequest(endpoint, parameters)
          } catch (error) {
            var access_token = 'XXX.XXX.XXXX'
            //throw new Error('Error when accessing token')
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

  function siweMessageToSign(policy: string, address: string, chainId: number, code: any, nonce: any) 
    {
    //ONLY FOR THE SAKE OF A WORKING EXAMPLE
    const policy2 = `https://example.com on behalf of https://gamimum.world wants\
      you to sign in with your Ethereum account: ${address} \n\
      You allow https://example.com to access https://gamium.world.com resources:\n\
      - profile: view your profile\n\
      - wallet: view your wallet address\n\
      You accept the Terms of Service of:\n\
      - https://gamimum.world/tos\n\
      - https://application-resource/tos\n\
      URI: https://gamimum.world\n\
      Chain ID: ${chainId}\n\
      Nonce: ${nonce}\n\
      Issued At: 3132311412\n\
      Expiration Time: 3132311412\n\
      Request ID: 92181282121`;

    const defaultConfigurableOptions = {
      domain: window.location.host,
      statement: policy ?? policy2,
      uri: window.location.origin,
      version: '1',
    };
    const unconfigurableOptions = {
      address,
      chainId,
      code,
      nonce,
    };

    const messageToSign = new SiweMessage({
      ...defaultConfigurableOptions,
      ...(getSiweMessageOptions == null ? void 0 : getSiweMessageOptions()),
      ...unconfigurableOptions,
    });
    return messageToSign;
}
async function postRequest(endpoint: string, formBodyJoined: string) {
  return fetch(`${endpoint}`, {
    body: formBodyJoined,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    method: 'POST',
  });
}
  function walletAuthPayload(address: string) {
    throw new Error('Function not implemented.');
}
