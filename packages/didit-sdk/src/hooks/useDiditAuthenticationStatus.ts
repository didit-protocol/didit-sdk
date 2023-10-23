import { useDiditAuthContext } from '../contexts/diditAuthContext';

const useDiditAuthenticationStatus = () => {
  const { status } = useDiditAuthContext();

  return status || null;
};

export default useDiditAuthenticationStatus;
