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
        baseUrl="http://127.0.0.1:8000/email-auth"
        clientId="676573"
        claims="read:emails write:emails"
        scope="openid profile"
        onLogin={(_authMethod: string) =>
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
