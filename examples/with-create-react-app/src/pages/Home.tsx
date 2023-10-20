import { useEffect, useState } from 'react';

import {
  DiditLogin,
  ConnectButton,
  useDiditStatus,
  useAuthenticationAdapter,
} from 'didit-sdk';

const Home = () => {
  const { authMethod, token, status, error } = useDiditStatus();
  const adapter = useAuthenticationAdapter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const accessToken = String(token);

  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
      }}
    >
      <div>
        <h1>Didit Protocol</h1>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <p>
            <span>Didit status: </span>
            <span>
              <b>{status}</b>
            </span>
          </p>
          {isAuthenticated && (
            <button onClick={() => adapter.signOut()}>LOGOUT</button>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <p>
            <span>Didit auth method: </span>
            <span>
              <b>{authMethod}</b>
            </span>
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <p>
            <span>Didit access token: </span>
            {isAuthenticated && (
              <span>
                <b>{`${accessToken.slice(0, 8)}...${accessToken.slice(-8)}`}</b>
              </span>
            )}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <DiditLogin mode="embedded" />
          <button onClick={() => setIsLoginModalOpen(true)}>
            open login modal
          </button>
          <DiditLogin
            mode="modal"
            isModalOpen={isLoginModalOpen}
            onModalClose={() => setIsLoginModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
