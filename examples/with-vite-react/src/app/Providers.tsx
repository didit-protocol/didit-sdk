import {
  lightTheme,
  DiditAuthProvider,
  DiditRainbowkitProvider,
  DiditAuthMethod,
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
        authMethods={[DiditAuthMethod.WALLET, DiditAuthMethod.GOOGLE]}
        baseUrl={import.meta.env.VITE_DIDIT_AUTH_BASE_URL || ''}
        clientId={import.meta.env.VITE_DIDIT_CLIENT_ID || ''}
        claims={import.meta.env.VITE_DIDIT_CLAIMS}
        scope={import.meta.env.VITE_DIDIT_SCOPE || ''}
        onLogin={(_authMethod?: DiditAuthMethod) =>
          console.log('Logged in Didit with', _authMethod)
        }
        onLogout={() => console.log('Logged out Didit')}
        onError={(_error: string) => console.error('Didit error: ', _error)}
      >
        <DiditRainbowkitProvider chains={chains} theme={lightTheme()}>
          {children}
        </DiditRainbowkitProvider>
      </DiditAuthProvider>
    </WagmiConfig>
  );
};

export default Providers;
