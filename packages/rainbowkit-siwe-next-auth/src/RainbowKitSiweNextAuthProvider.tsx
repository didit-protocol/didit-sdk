import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
} from '@rainbow-me/rainbowkit';
import { getCsrfToken, signOut, useSession } from 'next-auth/react';
import React, { ReactNode, useMemo } from 'react';
import { SiweMessage } from "siwe";

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
        // THIS METHOD SHOULD NOT BE ASYNC FOR message.prepareMessage() 
        // THIS METHOD SHOUL ALWAYS RETURN SiweMessage
        // @Todo: we should get it out from the response2 if statement
        createMessage: ({ address, chainId }) => {
          //What have to be this?? Ask hsioming
          //TO DANI : ALL CONFIGS SHOULD BE IN .ENV OR CONF FILE 
          const resource = 'dededede';
          const endpoint = 'https://auth.dev.gamium.fun/api/wallet_verify';
          const parameters = `scope=${scopes}&resource=${resource}&wallet_address=${address}&clientId=${clientId}`;
          let response2;
          try {
             fetch(`${endpoint}/${parameters}`);
          } catch (error) {
 
          }
          response2 = {
            applicationName: 'Wallapop',
            audience: 'https://application-resource',
            code: 'abcd',
            expires_at: 1676545268,
            issued_at: 1676545268,
            nonce: 'a-random-string',
            policy: 'text to display on wallet popup',
            requestId: 214212412,
            scope: 'openid profile wallet',
          };
          //if (response2) {
            const {
              applicationName,
              code,
              expires_at,
              issued_at,
              nonce,
              requestId,
            } = response2;

            //NEED TO GENERATE THE MESSAGE ON SCOPES
            //Not Before: ${not-before}\
            //POLICY ALL TOGETHER
            const policy2 = `${applicationName} on behalf of https://gamimum.world wants\
            you to sign in with your Ethereum account: ${address} \n\
            You allow ${applicationName} to access ${resource} resources:\n\
            - profile: view your profile\n\
            - wallet: view your wallet address\n\
            You accept the Terms of Service of:\n\
            - https://gamimum.world/tos\n\
            - https://application-resource/tos\n\
            URI: https://gamimum.world\n\
            Chain ID: ${chainId}\n\
            Nonce: ${nonce}\n\
            Issued At: ${issued_at}\n\
            Expiration Time: ${expires_at}\n\
            Request ID: ${requestId}`;

            const defaultConfigurableOptions = {
              domain: window.location.host,
              statement: policy2,
              uri: window.location.origin,
              version: '1',
            };
            const unconfigurableOptions = {
              address,
              chainId,
              code,
              nonce,
            };
            return new SiweMessage({
              ...defaultConfigurableOptions,
              ...(getSiweMessageOptions == null
                ? void 0
                : getSiweMessageOptions()),
              ...unconfigurableOptions,
            });
        //  }

        },

        getMessageBody:  ({ message }) => message.prepareMessage(),

        getNonce: async () => {
          const nonce = await getCsrfToken();
          if (!nonce) throw new Error();
          return nonce;
        },

        signOut: async () => {
          await signOut({ redirect: false });
        },

        verify: async ({ code, signature }) => {
          //TOKEN ENDPOINT
          const endpoint = 'https://auth.dev.gamium.fun/api/token';
          const parameters = `grant_type=walletconnect&code=${code}&client_id=${clientId}&code=${code}&wallet_signature=${signature}`;
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await fetch(`${endpoint}/${parameters}`);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log('ERROR', error);
          }
          const response2 = {
            access_token: 'A.JWT.Token',
            expires_in: 3600,
            id_token: '...',
            scope: 'openid profile wallet', // if requesting with `openid` scope
          };
          return { token: response2.access_token, verified: true };
        },
      }),
    [clientId, getSiweMessageOptions, scopes]
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
}
