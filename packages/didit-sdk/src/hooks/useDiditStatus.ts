import { useContext } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';

const useDiditStatus = () => {
  const { authMethod, error, status, token } = useDiditAuthContext();
  const { address } = useContext(RainbowKitAuthenticationContext) ?? {};

  return {
    authMethod,
    error,
    status,
    token,
    walletAddress: address,
  };
};

export default useDiditStatus;
