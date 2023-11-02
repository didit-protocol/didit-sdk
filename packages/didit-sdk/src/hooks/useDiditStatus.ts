import { useContext } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';

const useDiditStatus = () => {
  const { accessToken, authMethod, error, status } = useDiditAuthContext();
  const { address } = useContext(RainbowKitAuthenticationContext) ?? {};

  return {
    accessToken,
    authMethod,
    error,
    status,
    walletAddress: address,
  };
};

export default useDiditStatus;
