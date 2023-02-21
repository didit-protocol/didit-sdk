// src/RainbowKitSiweNextAuthProvider.tsx
import {
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider
} from "@rainbow-me/rainbowkit";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import React, { useMemo } from "react";
import { SiweMessage } from "siwe";
function RainbowKitSiweNextAuthProvider({
  children,
  enabled,
  getSiweMessageOptions
}) {
  const { status } = useSession();
  const adapter = useMemo(() => createAuthenticationAdapter({
    createMessage: async ({
      address,
      chainId,
      clientId,
      resource,
      scopes
    }) => {
      const endpoint = "https://auth.dev.gamium.fun/api/wallet_verify";
      const parameters = `scope=${scopes}&resource=${resource}&wallet_address=${address}&clientId=${clientId}`;
      let response2;
      try {
        await fetch(`${endpoint}/${parameters}`);
      } catch (error) {
        response2 = {
          applicationName: "Wallapop",
          code: "abcd",
          audience: "https://application-resource",
          policy: "text to display on wallet popup",
          expires_at: 1676545268,
          nonce: "a-random-string",
          issued_at: 1676545268,
          scope: "openid profile wallet",
          requestId: 214212412
        };
      }
      if (response2) {
        const {
          applicationName,
          expires_at,
          issued_at,
          code,
          nonce,
          policy,
          requestId
        } = response2;
        const policy2 = `${applicationName} on behalf of https://gamimum.world wants            you to sign in with your Ethereum account: ${address} 
            You allow ${applicationName} to access ${resource} resources:
            - profile: view your profile
            - wallet: view your wallet address
            You accept the Terms of Service of:
            - https://gamimum.world/tos
            - https://application-resource/tos
            URI: https://gamimum.world
            Chain ID: ${chainId}
            Nonce: ${nonce}
            Issued At: ${issued_at}
            Expiration Time: ${expires_at}
            Request ID: ${requestId}`;
        console.log("POLICY2", policy2);
        const defaultConfigurableOptions = {
          domain: window.location.host,
          statement: policy2,
          uri: window.location.origin,
          version: "1"
        };
        const unconfigurableOptions = {
          address,
          chainId,
          code,
          nonce
        };
        return new SiweMessage({
          ...defaultConfigurableOptions,
          ...getSiweMessageOptions == null ? void 0 : getSiweMessageOptions(),
          ...unconfigurableOptions
        });
      }
    },
    getMessageBody: ({ message }) => message.prepareMessage(),
    getNonce: async () => {
      const nonce = await getCsrfToken();
      if (!nonce)
        throw new Error();
      return nonce;
    },
    signOut: async () => {
      await signOut({ redirect: false });
    },
    verify: async ({ clientId, signature, code }) => {
      const endpoint = "https://auth.dev.gamium.fun/api/token";
      const parameters = `grant_type=walletconnect&code=${code}&client_id=${clientId}&code=${code}&wallet_signature=${signature}`;
      try {
        const response = await fetch(`${endpoint}/${parameters}`);
      } catch (error) {
        console.log("ERROR", error);
      }
      const response2 = {
        access_token: "A.JWT.Token",
        expires_in: 3600,
        id_token: "...",
        scope: "openid profile wallet"
      };
      return { token: response2.access_token, verified: true };
    }
  }), [getSiweMessageOptions]);
  return /* @__PURE__ */ React.createElement(RainbowKitAuthenticationProvider, {
    adapter,
    enabled,
    status
  }, children);
}
export {
  RainbowKitSiweNextAuthProvider
};
