import { ConnectButton } from 'diditsdktest';
import { midnightTheme, getDefaultWallets, DiditAuthProvider } from 'diditsdktest';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  DiditProvider,
} from 'diditprovidertest';

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    ...(process.env.REACT_APP_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const App = () => {
  return (
    <WagmiConfig client={wagmiClient}>
      <DiditProvider client_id='http://127.0.0.1:8000/avatar/integrations' scopes='openid'>
          <DiditAuthProvider chains={chains} theme={ midnightTheme() }>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      <ConnectButton />
    </div>
       </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default App;
