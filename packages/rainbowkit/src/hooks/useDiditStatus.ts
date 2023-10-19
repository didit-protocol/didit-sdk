import { useContext } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';

const useDiditStatus = () => {
  const { authMethod, error, status, token } = useDiditAuthContext();
  const { address } = useContext(RainbowKitAuthenticationContext) ?? {};

  return {
    address,
    authMethod,
    error,
    status,
    token,
  };
};

export default useDiditStatus;
