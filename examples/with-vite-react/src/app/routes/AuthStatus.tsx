import { useEffect } from 'react';
import {
  useDiditStatus,
  useAuthenticationAdapter,
  useConnectModal,
} from 'didit-sdk';

function AuthStatus() {
  const { accessToken, walletAddress, status, error } = useDiditStatus();
  const adapter = useAuthenticationAdapter();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <>
      <h1>
        This is the second view token: {accessToken} address: {walletAddress}{' '}
        status: {status}
      </h1>
      <button onClick={() => adapter.signOut()}>LOGOUT</button>
      {openConnectModal && (
        <button onClick={() => openConnectModal()}>LOGIN</button>
      )}
    </>
  );
}

export default AuthStatus;
