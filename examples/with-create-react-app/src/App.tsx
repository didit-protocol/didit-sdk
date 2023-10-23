import 'didit-sdk/styles.css';
import {
  getDefaultWallets,
  lightTheme,
  DiditAuthProvider,
  DiditRainbowkitProvider,
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
        authMethods={[DiditAuthMethod.GOOGLE, DiditAuthMethod.WALLET]}
        baseUrl={process.env.REACT_APP_DIDIT_AUTH_BASE_URL || ''}
        clientId={process.env.REACT_APP_DIDIT_CLIENT_ID || ''}
        claims={process.env.REACT_APP_DIDIT_CLAIMS}
        scope={process.env.REACT_APP_DIDIT_SCOPE || ''}
        onLogin={(_authMethod?: DiditAuthMethod) =>
          console.log('DiditAuthProvider: Logged in Didit with', _authMethod)
        }
        onLogout={() => console.log('DiditAuthProvider: Logged out from Didit')}
        onError={(_error: string) =>
          console.error('DiditAuthProvider: Didit error: ', _error)
        }
      >
        <DiditRainbowkitProvider chains={chains} theme={lightTheme()}>
          <Home />
        </DiditRainbowkitProvider>
      </DiditAuthProvider>
    </WagmiConfig>
  );
}

export default App;
