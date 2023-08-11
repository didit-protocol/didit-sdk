import { ConnectButton } from 'didit-sdk';
import { midnightTheme, getDefaultWallets, DiditAuthProvider } from 'didit-sdk';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  goerli,
  zora,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecondView from './views/SecondView';
import ThirdView from './views/thirdView';
import { DiditProvider } from 'didit-provider';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    zora,
    ...(process.env.REACT_APP_ENABLE_TESTNETS === 'true' ? [goerli] : []),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId: 'b0337f8e2c56c722a1fb3a4cdf893249',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const App = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <DiditProvider clientUrl="https://apx.dev.gamium.world/avatar/auth">
        <DiditAuthProvider chains={chains} theme={midnightTheme()}>
          <Router>
            <Routes>
              <Route path="/app" element={<SecondView />} />
              <Route path="/js" element={<ThirdView />} />
              <Route path="" element={<ConnectButton />} />
            </Routes>
          </Router>
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default App;
