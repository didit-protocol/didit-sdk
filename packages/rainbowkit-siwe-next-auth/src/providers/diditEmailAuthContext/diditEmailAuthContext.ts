import { createContext, useContext } from 'react';
import { SocialAuthProvider } from '../../types';

const CONTEXT_NAME = 'DiditEmailAuth';

interface DiditEmailAuthContextState {
  login: (socialAuthProvider: SocialAuthProvider) => void;
  logout: () => void;
  token?: string;
}

const defaultState: DiditEmailAuthContextState = {
  login: () => {},
  logout: () => {},
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
