import { createContext, useContext } from 'react';
import {
  AuthenticationStatus,
  DiditAuthMethod,
  SocialAuthProvider,
} from '../../types';

const CONTEXT_NAME = 'DiditAuth';

interface DiditAuthContextState {
  authMethod?: DiditAuthMethod;
  availableAuthMethods: DiditAuthMethod[];
  error?: string;
  login: (authMethod: DiditAuthMethod) => void;
  loginWithApple: () => void;
  loginWithEmail: () => void;
  loginWithGoogle: () => void;
  loginWithSocial: (socialAuthProvider: SocialAuthProvider) => void;
  loginWithWallet: () => void;
  logout: () => void;
  status: AuthenticationStatus;
  token?: string;
}

const defaultState: DiditAuthContextState = {
  authMethod: undefined,
  availableAuthMethods: [],
  error: undefined,
  login: () => {},
  loginWithApple: () => {},
  loginWithEmail: () => {},
  loginWithGoogle: () => {},
  loginWithSocial: () => {},
  loginWithWallet: () => {},
  logout: () => {},
  status: AuthenticationStatus.LOADING,
  token: undefined,
};

const DiditAuthContext = createContext(defaultState);
DiditAuthContext.displayName = CONTEXT_NAME;

const useDiditAuthContext = () => {
  const context = useContext(DiditAuthContext);
  if (context === undefined) {
    throw new Error(
      `use${CONTEXT_NAME}Context must be used within a ${CONTEXT_NAME}Provider`
    );
  }
  return context;
};

export default useDiditAuthContext;
export { DiditAuthContext };
