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
        baseUrl="http://127.0.0.1:8000/email-auth"
        clientId="676573"
        claims="read:emails write:emails"
        scope="openid profile"
      >
        <DiditRainbowkitProvider chains={chains} theme={lightTheme()}>
          {children}
        </DiditRainbowkitProvider>
      </DiditAuthProvider>
    </WagmiConfig>
  );
};

export default Providers;
