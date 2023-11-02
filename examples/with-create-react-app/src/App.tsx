import 'didit-sdk/styles.css';
import {
  getDefaultWallets,
  lightTheme,
  DiditAuthProvider,
  DiditEmailAuthMode,
  DiditAuthMethod,
} from 'didit-sdk';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  goerli,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Home from './pages/Home';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    ...(process.env.REACT_APP_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: process.env.REACT_APP_APP_NAME || '',
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <DiditAuthProvider
        authMethods={[
          DiditAuthMethod.GOOGLE,
          DiditAuthMethod.WALLET,
          DiditAuthMethod.APPLE,
        ]}
        emailAuthBaseUrl={process.env.REACT_APP_DIDIT_EMAIL_AUTH_BASE_URL || ''}
        walletAuthBaseUrl={
          process.env.REACT_APP_DIDIT_WALLET_AUTH_BASE_URL || ''
        }
        clientId={process.env.REACT_APP_DIDIT_CLIENT_ID || ''}
        claims={process.env.REACT_APP_DIDIT_CLAIMS}
        emailAuthMode={DiditEmailAuthMode.POPUP}
        redirectUri={process.env.REACT_APP_DIDIT_REDIRECT_URI || ''}
        scope={process.env.REACT_APP_DIDIT_SCOPE || ''}
        onLogin={(_authMethod?: DiditAuthMethod) =>
          console.log('DiditAuthProvider: Logged in Didit with', _authMethod)
        }
        onLogout={() => console.log('DiditAuthProvider: Logged out from Didit')}
        onError={(_error: string) =>
          console.error('DiditAuthProvider: Didit error: ', _error)
        }
        chains={chains}
        theme={lightTheme()}
      >
        <Home />
      </DiditAuthProvider>
    </WagmiConfig>
  );
}

export default App;
