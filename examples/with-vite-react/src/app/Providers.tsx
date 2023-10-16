import { lightTheme, DiditAuthProvider } from 'didit-sdk';
import { WagmiConfig } from 'wagmi';
import { DiditProvider } from 'didit-provider';
import { config, chains } from './config/wagmi';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <WagmiConfig config={config}>
      <DiditProvider clientUrl="https://apx.dev.didit.me/profile/authorizations/v1">
        <DiditAuthProvider chains={chains} theme={lightTheme()}>
          {children}
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default Providers;
