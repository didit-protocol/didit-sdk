import 'didit-sdk/styles.css';
import {
  getDefaultWallets,
  lightTheme,
  DiditAuthProvider,
  ConnectButton,
} from 'didit-sdk';
import { DiditProvider } from 'didit-provider';
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
      <DiditProvider clientUrl="https://apx.dev.didit.me/profile/authorizations/v1">
        <DiditAuthProvider chains={chains} theme={lightTheme()}>
          <div
            style={{
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 12,
            }}
          >
            <div>
              <h1>Didit Protocol</h1>
              <ConnectButton />
            </div>
          </div>
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
}

export default App;
