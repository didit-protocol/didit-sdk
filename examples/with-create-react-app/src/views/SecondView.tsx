import React from 'react';
import {
  useDiditStatus,
  useAuthenticationAdapter,
  useConnectModal,
} from 'diditsdktest';

function SecondView() {
  const { token, address, status } = useDiditStatus();
  const adapter = useAuthenticationAdapter();
  const { openConnectModal } = useConnectModal();
  return (
    <>
      <h1>
        This is the second view token: {token} address: {address} status:{' '}
        {status}
      </h1>
      <button onClick={() => adapter.signOut()}>LOGOUT</button>
      {openConnectModal && (
        <button onClick={() => openConnectModal()}>LOGIN</button>
      )}
    </>
  );
}

export default SecondView;
