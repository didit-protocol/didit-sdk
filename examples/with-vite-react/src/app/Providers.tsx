import { lightTheme, DiditAuthProvider } from 'didit-sdk';
import { WagmiConfig } from 'wagmi';
import { DiditEmailAuthProvider, DiditProvider } from 'didit-provider';
import { config, chains } from './config/wagmi';

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  return (
    <WagmiConfig config={config}>
      <DiditProvider clientUrl="https://apx.dev.didit.me/profile/authorizations/v1">
        <DiditEmailAuthProvider
          baseUrl="http://127.0.0.1:8000/email-auth"
          clientId="676573"
        >
          <DiditAuthProvider chains={chains} theme={lightTheme()}>
            {children}
          </DiditAuthProvider>
        </DiditEmailAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};

export default Providers;
