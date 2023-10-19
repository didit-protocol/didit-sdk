import {
  lightTheme,
  DiditAuthProvider,
  DiditRainbowkitProvider,
} from 'didit-sdk';
import { WagmiConfig } from 'wagmi';
import { config, chains } from './config/wagmi';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <WagmiConfig config={config}>
      <DiditAuthProvider
        baseUrl="https://apx.dev.didit.me/profile"
        clientId="676573"
        claims="read:email write:email"
      >
        <DiditRainbowkitProvider chains={chains} theme={lightTheme()}>
          {children}
        </DiditRainbowkitProvider>
      </DiditAuthProvider>
    </WagmiConfig>
  );
};

export default Providers;
