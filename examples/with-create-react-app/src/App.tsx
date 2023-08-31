import { GoogleOAuthProvider } from '@react-oauth/google';
import { DiditProvider } from 'didit-provider';
import { ConnectButton, DiditAuthProvider, getDefaultWallets, midnightTheme } from 'didit-sdk';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { arbitrum, goerli, mainnet, optimism, polygon } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import SecondView from './views/SecondView';
import ThirdView from './views/thirdView';


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
  projectId: 'b0337f8e2c56c722a1fb3a4cdf893249',
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
      <GoogleOAuthProvider clientId={"55269255886-5pk8sc27q5othqcgtrbor6fldsnu2psg.apps.googleusercontent.com"}>
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
      </GoogleOAuthProvider>
    </WagmiConfig>
  );
};

export default App;
