import {
  lightTheme,
  getDefaultWallets,
  DiditAuthProvider,
  ConnectButton,
} from 'didit-sdk';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecondView from './views/SecondView';
import ThirdView from './views/thirdView';
import EmbeddedLoginView from './views/EmbeddedLoginView';
import ModalLoginView from './views/ModalLoginView';
import { DiditProvider } from 'didit-provider';

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
      <DiditProvider clientUrl="https://apx.dev.gamium.world/avatar/auth">
        <DiditAuthProvider chains={chains} theme={lightTheme()}>
          <Router>
            <Routes>
              <Route path="/app" element={<SecondView />} />
              <Route path="/js" element={<ThirdView />} />
              <Route path="" element={<ConnectButton />} />
              <Route path="/login/embedded" element={<EmbeddedLoginView />} />
              <Route path="/login/modal" element={<ModalLoginView />} />
            </Routes>
          </Router>
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default App;
