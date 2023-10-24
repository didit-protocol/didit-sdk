import { useAccount } from 'wagmi';
import useDiditAuthenticationStatus from './useDiditAuthenticationStatus';

export type ConnectionStatus =
  | 'disconnected'
  | 'loading'
  | 'unauthenticated'
  | 'connected';

export function useConnectionStatus(): ConnectionStatus {
  const authenticationStatus = useDiditAuthenticationStatus();
  const { isConnected } = useAccount();

  if (!isConnected) {
    return 'disconnected';
  }

  if (!authenticationStatus) {
    return 'connected';
  }

  if (
    authenticationStatus === 'loading' ||
    authenticationStatus === 'unauthenticated'
  ) {
    return authenticationStatus;
  }

  return 'connected';
}
