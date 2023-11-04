import { useState } from 'react';

import {
  DiditAuthMethod,
  DiditLogin,
  DiditLoginButton,
  DiditLoginMode,
  DiditLogoutButton,
  useDiditAuth,
} from 'didit-sdk';

const Home = () => {
  const {
    authMethod,
    status,
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
  } = useDiditAuth({
    onError: (_error: string) =>
      console.error('useDiditAuth: Didit error: ', _error),
    onLogin: (_authMethod?: string) =>
      console.log('useDiditAuth: Logged in Didit with', _authMethod),
    onLogout: () => console.log('useDiditAuth: Logged out from Didit'),
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
                {accessToken && (
                  <b>{`${accessToken.slice(0, 8)}...${accessToken.slice(
                    -8
                  )}`}</b>
                )}
              </span>
            )}
          </p>
          <p>
            <span>Didit refresh token: </span>
            {isAuthenticated && (
              <span>
                {refreshToken && (
                  <b>{`${refreshToken.slice(0, 8)}...${refreshToken.slice(
                    -8
                  )}`}</b>
                )}
              </span>
            )}
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
            <span>Didit identifier type: </span>
            <span>
              <b>{user?.identifierType}</b>
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
            <span>Didit identifier : </span>
            <span>
              <b>{user?.identifier}</b>
            </span>
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          <DiditLogin mode={DiditLoginMode.EMBEDDED} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: '40px',
            marginBottom: '40px',
          }}
        >
          <button onClick={() => setIsLoginModalOpen(true)}>
            open login modal
          </button>
          <DiditLogin
            mode={DiditLoginMode.MODAL}
            isModalOpen={isLoginModalOpen}
            onModalClose={() => setIsLoginModalOpen(false)}
          />
          <DiditLoginButton
            label="Connect with Didit"
            authMethod={DiditAuthMethod.GOOGLE}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
