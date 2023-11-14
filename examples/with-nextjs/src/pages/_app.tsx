import 'src/styles/globals.css';
import 'didit-sdk/styles.css';
import {
  DiditAuthMethod,
  DiditAuthProvider,
  DiditEmailAuthMode,
  getDefaultWallets,
  lightTheme,
} from 'didit-sdk';
import type { AppProps } from 'next/app';

import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { arbitrum, base, mainnet, optimism, polygon, zora } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_APP_NAME || '',
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'cutsom id',
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig
      config={wagmiConfig} // The one that was configured before for Wagmi
    >
      <DiditAuthProvider
        authBaseUrl={process.env.NEXT_PUBLIC_DIDIT_AUTH_BASE_URL || ''}
        authMethods={[
          DiditAuthMethod.WALLET,
          DiditAuthMethod.GOOGLE,
          DiditAuthMethod.APPLE,
        ]}
        chains={chains}
        claims={process.env.NEXT_PUBLIC_DIDIT_CLAIMS}
        clientId={process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID || ''}
        emailAuthMode={DiditEmailAuthMode.POPUP}
        onError={(_error: string) => console.error('Didit error: ', _error)}
        onLogin={(_authMethod?: DiditAuthMethod) =>
          console.warn('Logged in Didit with', _authMethod)
        }
        onLogout={() => console.warn('Logged out Didit')}
        redirectUri={
          process.env.NEXT_PUBLIC_DIDIT_REDIRECT_URI || 'http://localhost'
        }
        scope={process.env.NEXT_PUBLIC_DIDIT_SCOPE}
        theme={lightTheme()}
        tokenAuthorizationPath="/token"
        walletAuthBaseUrl={
          process.env.NEXT_PUBLIC_DIDIT_WALLET_AUTH_BASE_URL ||
          'http://localhost'
        }
        walletAuthorizationPath="/wallet-authorization"
      >
        <Component {...pageProps} />
      </DiditAuthProvider>
    </WagmiConfig>
  );
}
