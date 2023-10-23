import { useState } from 'react';

import { DiditLogin, DiditLogoutButton, useDiditAuth } from 'didit-sdk';

const Home = () => {
  const { authMethod, status, token, isAuthenticated } = useDiditAuth({
    onError: (_error: string) =>
      console.error('useDiditAuth: Didit error: ', _error),
    onLogin: (_authMethod?: string) =>
      console.log('useDiditAuth: Logged in Didit with', _authMethod),
    onLogout: () => console.log('useDiditAuth: Logged out from Didit'),
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const accessToken = String(token);

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
          <DiditLogoutButton />
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
