import { useContext } from 'react';
import { RainbowKitAuthenticationContext } from '../components/RainbowKitProvider/AuthenticationContext';
import { useConnectModal } from '../components/RainbowKitProvider/ModalContext';
import { useDiditAuthContext } from '../contexts/diditAuthContext';

const useDiditAuth = () => {
  const diditAuthContext = useDiditAuthContext();
  const rainbowKitAuthenticationContext =
    useContext(RainbowKitAuthenticationContext) ?? {};
  const connectModal = useConnectModal();

  return {
    ...diditAuthContext,
    ...rainbowKitAuthenticationContext,
    ...connectModal,
  };
};

export default useDiditAuth;
