import { createContext, useContext } from 'react';
import { AuthenticationStatus, DiditAuthMethod } from '../../types';

const CONTEXT_NAME = 'DiditAuth';

interface DiditAuthContextState {
  authMethod?: DiditAuthMethod;
  availableAuthMethods: DiditAuthMethod[];
  error?: string;
  logout: () => void;
  status: AuthenticationStatus;
  token?: string;
}

const defaultState: DiditAuthContextState = {
  authMethod: undefined,
  availableAuthMethods: [],
  error: undefined,
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
