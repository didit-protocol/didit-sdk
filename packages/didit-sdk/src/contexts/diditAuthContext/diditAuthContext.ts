import { createContext, useContext } from 'react';
import {
  DiditAuthMethod,
  DiditAuthStatus,
  DiditTokenInfo,
  DiditUser,
} from '../../types';

const CONTEXT_NAME = 'DiditAuth';

interface DiditAuthContextState {
  authMethod?: DiditAuthMethod;
  availableAuthMethods: DiditAuthMethod[];
  error?: string;
  logout: () => void;
  status: DiditAuthStatus;
  accessToken?: string;
  refreshToken?: string;
  accessTokenInfo?: DiditTokenInfo;
  user?: DiditUser;
}

const defaultState: DiditAuthContextState = {
  accessToken: undefined,
  accessTokenInfo: undefined,
  authMethod: undefined,
  availableAuthMethods: [],
  error: undefined,
  logout: () => {},
  refreshToken: undefined,
  status: DiditAuthStatus.UNAUTHENTICATED,
  user: undefined,
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
