import { useCallback, useContext } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useConnectModal } from '../components/RainbowKitProvider/ModalContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';
import { useDiditEmailAuthContext } from '../contexts/diditEmailAuthContext';
import { DiditAuthMethod } from '../types';

const useDiditAuth = () => {
  const { authMethod, availableAuthMethods, error, logout, status, token } =
    useDiditAuthContext();
  const { loginWithApple, loginWithEmail, loginWithGoogle, loginWithSocial } =
    useDiditEmailAuthContext();
  const { address } = useContext(RainbowKitAuthenticationContext) ?? {};
  const { openConnectModal: loginWithWallet } = useConnectModal();

  const login = useCallback(
    (authMethod: DiditAuthMethod) => {
      const loginMethods = {
        // [DiditAuthMethod.APPLE]: loginWithApple,
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
    [loginWithGoogle, loginWithWallet]
  );

  return {
    authMethod,
    availableAuthMethods,
    error,
    login,
    loginWithApple,
    loginWithEmail,
    loginWithGoogle,
    loginWithSocial,
    loginWithWallet,
    logout,
    status,
    token,
    walletAddress: address,
  };
};

export default useDiditAuth;
