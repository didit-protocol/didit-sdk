import { createContext, useContext } from 'react';
import { AuthenticationStatus, SocialAuthProvider } from '../../types';

const CONTEXT_NAME = 'DiditEmailAuth';

interface DiditEmailAuthContextState {
  error?: string;
  loginWithApple: () => void;
  loginWithEmail: () => void;
  loginWithGoogle: () => void;
  loginWithSocial: (socialAuthProvider: SocialAuthProvider) => void;
  status: AuthenticationStatus;
  token?: string;
}

const defaultState: DiditEmailAuthContextState = {
  error: undefined,
  loginWithApple: () => {},
  loginWithEmail: () => {},
  loginWithGoogle: () => {},
  loginWithSocial: () => {},
  status: AuthenticationStatus.LOADING,
  token: undefined,
};

const DiditEmailAuthContext = createContext(defaultState);
DiditEmailAuthContext.displayName = CONTEXT_NAME;

const useDiditEmailAuthContext = () => {
  const context = useContext(DiditEmailAuthContext);
  if (context === undefined) {
    throw new Error(
      `use${CONTEXT_NAME}Context must be used within a ${CONTEXT_NAME}Provider`
    );
  }
  return context;
};

export default useDiditEmailAuthContext;
export { DiditEmailAuthContext };
