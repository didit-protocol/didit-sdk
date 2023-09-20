import React, { useEffect } from 'react';
import {
  useDiditStatus,
  useAuthenticationAdapter,
  useConnectModal,
} from 'didit-sdk';

function SecondView() {
  const { token, address, status, error } = useDiditStatus();
  const adapter = useAuthenticationAdapter();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>
        This is the second view token: {token} address: {address} status:{' '}
        {status}
      </h1>
      <button onClick={() => adapter.signOut()}>LOGOUT</button>
      {openConnectModal && (
        <button onClick={() => openConnectModal()}>LOGIN</button>
      )}
    </div>
  );
}

export default SecondView;
