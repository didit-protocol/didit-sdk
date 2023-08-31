import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useAccount } from 'wagmi';

export type AuthenticationStatus =
  | 'loading'
  | 'unauthenticated'
  | 'authenticated';

export interface AuthenticationAdapter {
  getNonce: () => Promise<string>;
  createMessage: (args: { address: string }) => Promise<{
    code: string;
    policy: string;
  }>;
  getMessageBody: (args: { message: string }) => string;
  callbackGoogle: (args: string ) => Promise<boolean>;
  verify: (args: { code: string; signature: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export interface AuthenticationConfig {
  adapter: AuthenticationAdapter;
  status: AuthenticationStatus;
  token: string | boolean;
  address: string;
  error: string;
}

// Right now this function only serves to infer the generic Message type
export function createAuthenticationAdapter(adapter: AuthenticationAdapter) {
  return adapter;
}

const AuthenticationContext = createContext<AuthenticationConfig | null>(null);

interface RainbowKitAuthenticationProviderProps extends AuthenticationConfig {
  enabled?: boolean;
  children: ReactNode;
}

export function RainbowKitAuthenticationProvider({
  adapter,
  address,
  children,
  enabled = true,
  error,
  status,
  token,
}: RainbowKitAuthenticationProviderProps) {
  // When the wallet is disconnected, we want to tell the auth
  // adapter that the user session is no longer active.
  useAccount({
    onDisconnect: () => {
      adapter.signOut();
    },
  });

  // If the user is authenticated but their wallet is disconnected
  // on page load (e.g. because they disconnected from within their
  // wallet), we immediately sign them out using the auth adapter.
  // This is because our UX is designed to present connection + auth
  // as a single state, so we need to ensure these states are in sync.
  const { isDisconnected } = useAccount();
  const onceRef = useRef(false);
  useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;

    if (isDisconnected && status === 'authenticated') {
      adapter.signOut();
    }
  }, [status, adapter, isDisconnected, token, address]);

  return (
    <AuthenticationContext.Provider
      value={useMemo(
        () => (enabled ? { adapter, address, error, status, token } : null),
        [enabled, adapter, status, token, address, error]
      )}
    >
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthenticationAdapter() {
  const { adapter } = useContext(AuthenticationContext) ?? {};

  if (!adapter) {
    throw new Error('No authentication adapter found');
  }

  return adapter;
}

export function useAuthenticationStatus() {
  const contextValue = useContext(AuthenticationContext);

  return contextValue?.status ?? null;
}

export function useDiditStatus() {
  const { address, error, status, token } =
    useContext(AuthenticationContext) ?? {};
  return { address, error, status, token };
}
