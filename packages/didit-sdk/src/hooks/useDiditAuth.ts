import { useCallback, useContext, useEffect, useMemo } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useConnectModal } from '../components/RainbowKitProvider/ModalContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';
import { useDiditEmailAuthContext } from '../contexts/diditEmailAuthContext';
import { DiditAuthMethod, DiditAuthStatus } from '../types';
import usePreviousState from './usePreviousState';

interface UseDiditAuthProps {
  onError?: (error: string) => void;
  onLogin?: (authMethod?: DiditAuthMethod) => void;
  onLogout?: () => void;
}

const useDiditAuth = ({
  onError = () => {},
  onLogin = () => {},
  onLogout = () => {},
}: UseDiditAuthProps = {}) => {
  const {
    accessToken,
    accessTokenInfo,
    authMethod,
    availableAuthMethods,
    error,
    logout: deauthenticate,
    refreshToken,
    status,
    user,
  } = useDiditAuthContext();
  const { loginWithApple, loginWithEmail, loginWithGoogle, loginWithSocial } =
    useDiditEmailAuthContext();
  const { adapter, address } =
    useContext(RainbowKitAuthenticationContext) ?? {};
  // TODO: useConnectModal will throw an error if we are noting using wallet auth method
  const { openConnectModal: loginWithWallet } = useConnectModal();

  // Boolean status
  const isAuthenticated = useMemo(() => {
    if (status === DiditAuthStatus.AUTHENTICATED) return true;
    if (status === DiditAuthStatus.UNAUTHENTICATED) return false;
    return undefined;
  }, [status]);
  const prevIsAuthenticated = usePreviousState(isAuthenticated);
  const isLoading = status === DiditAuthStatus.LOADING;
  const hasError = !!error;

  const login = useCallback(
    (authMethod: DiditAuthMethod) => {
      const loginMethods = {
        [DiditAuthMethod.APPLE]: loginWithApple,
        // [DiditAuthMethod.EMAIL]: loginWithEmail,
        [DiditAuthMethod.GOOGLE]: loginWithGoogle,
        [DiditAuthMethod.WALLET]: loginWithWallet,
      };
      const loginMethod = loginMethods[authMethod];

      if (!loginMethod) {
        throw new Error(`Invalid authentication method: ${authMethod}`);
      }
      loginMethod();
    },
    [loginWithGoogle, loginWithWallet, loginWithApple]
  );

  // Didit logout + disconnect from RainbowKit
  const logout = useCallback(() => {
    if (authMethod === DiditAuthMethod.WALLET && adapter) {
      adapter?.signOut?.();
    }
    deauthenticate();
  }, [adapter, authMethod, deauthenticate]);

  // Login and logout event callbacks
  useEffect(() => {
    if (!prevIsAuthenticated && isAuthenticated === true) {
      onLogin(authMethod);
    } else if (prevIsAuthenticated === true && isAuthenticated === false) {
      onLogout();
    }
  }, [authMethod, prevIsAuthenticated, isAuthenticated, onLogin, onLogout]);

  // Error callback
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return {
    accessToken,
    accessTokenInfo,
    authMethod,
    availableAuthMethods,
    error,
    hasError,
    isAuthenticated,
    isLoading,
    login,
    loginWithApple,
    loginWithEmail,
    loginWithGoogle,
    loginWithSocial,
    loginWithWallet,
    logout,
    refreshToken,
    status,
    user,
    walletAddress: address,
  };
};

export default useDiditAuth;
