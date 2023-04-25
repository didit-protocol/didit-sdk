import { ConnectButton } from 'diditsdktest';
import {
  midnightTheme,
  getDefaultWallets,
  DiditAuthProvider,
} from 'diditsdktest';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecondView from './views/SecondView';
import { DiditProvider } from 'diditprovidertest';

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
      <DiditProvider client_url="http://127.0.0.1:8000/avatar/auth">
        <DiditAuthProvider chains={chains} theme={midnightTheme()}>
          <Router>
            <Routes>
              <Route path="/app" element={<SecondView />} />
              <Route path="" element={<ConnectButton />} />
            </Routes>
          </Router>
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default App;
