import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  midnightTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecondView from './views/SecondView';
import ThirdView from './views/thirdView';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';

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

const projectId = 'b0337f8e2c56c722a1fb3a4cdf893249';

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId,
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
      <RainbowKitSiweNextAuthProvider clientUrl="https://apx.dev.gamium.world/avatar/auth">
        <RainbowKitProvider chains={chains} theme={midnightTheme()}>
          <Router>
            <Routes>
              <Route path="/app" element={<SecondView />} />
              <Route path="/js" element={<ThirdView />} />
              <Route path="" element={<ConnectButton />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </RainbowKitSiweNextAuthProvider>
    </WagmiConfig>
  );
};

export default App;
