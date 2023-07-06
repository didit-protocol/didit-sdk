import { ConnectButton } from 'diditsdktest';
import {
  midnightTheme,
  getDefaultWallets,
  DiditAuthProvider,
} from 'diditsdktest';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli, zora } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecondView from './views/SecondView';
import ThirdView from './views/thirdView';
import { DiditProvider } from 'diditprovidertest';

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

const projectId = 'YOUR_PROJECT_ID';


const { connectors } = getDefaultWallets({
  appName: 'RainbowKit demo',
  projectId,
  chains,
});

const wagmiClient = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const App = () => {
  return (
    <WagmiConfig config={wagmiClient}>
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
