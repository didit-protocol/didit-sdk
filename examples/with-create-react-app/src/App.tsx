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
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
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
        authMethods={[DiditAuthMethod.GOOGLE]}
        baseUrl="http://127.0.0.1:8000/email-auth"
        clientId="676573"
        claims="read:emails write:emails"
        scope="openid profile"
        onLogin={(_authMethod: string) =>
          console.log('Logged in Didit with', _authMethod)
        }
        onLogout={() => console.log('Logged out Didit')}
        onError={(_error: string) => console.error('Didit error: ', _error)}
      >
        <DiditRainbowkitProvider chains={chains} theme={lightTheme()}>
          <Home />
        </DiditRainbowkitProvider>
      </DiditAuthProvider>
    </WagmiConfig>
  );
}

export default App;
