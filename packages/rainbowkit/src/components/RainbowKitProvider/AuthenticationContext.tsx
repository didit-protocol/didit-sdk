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

export interface AuthenticationAdapter<Message> {
  getNonce: () => Promise<string>;
  createMessage: (args: {
    nonce: string;
    address: string;
    chainId: number;
  }) => Message;
  getMessageBody: (args: { message: Message }) => string;
  verify: (args: { code: string; signature: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export interface AuthenticationConfig<Message> {
  adapter: AuthenticationAdapter<Message>;
  status: AuthenticationStatus;
  token: string;
  address: string;
}

// Right now this function only serves to infer the generic Message type
export function createAuthenticationAdapter<Message>(
  adapter: AuthenticationAdapter<Message>
) {
  return adapter;
}

const AuthenticationContext = createContext<AuthenticationConfig<any> | null>(
  null
);

interface RainbowKitAuthenticationProviderProps<Message>
  extends AuthenticationConfig<Message> {
  enabled?: boolean;
  children: ReactNode;
}

export function RainbowKitAuthenticationProvider<Message = unknown>({
  adapter,
  address = '',
  children,
  enabled = true,
  status,
  token = '',
}: RainbowKitAuthenticationProviderProps<Message>) {
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
        () => (enabled ? { adapter, address, status, token } : null),
        [enabled, adapter, status, token, address]
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
  const { address, status, token } = useContext(AuthenticationContext) ?? {};
  return { address, status, token };
}
