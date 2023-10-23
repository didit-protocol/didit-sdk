import {
  DiditAuthMethod,
  DiditLogin,
  DiditLoginButton,
  DiditLogoutButton,
  useDiditAuth,
} from 'didit-sdk';
import { Inter } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { authMethod, isAuthenticated, status, token } = useDiditAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const accessToken = String(token);
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <h1>Didit Protocol</h1>
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'space-between',
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
            gap: 12,
            justifyContent: 'space-between',
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
            gap: 12,
            justifyContent: 'space-between',
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
            marginBottom: '40px',
            marginTop: '40px',
          }}
        >
          <DiditLogin mode="embedded" />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: '40px',
            marginTop: '40px',
          }}
        >
          <button onClick={() => setIsLoginModalOpen(true)} type="button">
            open login modal
          </button>
          <DiditLogin
            isModalOpen={isLoginModalOpen}
            mode="modal"
            onModalClose={() => setIsLoginModalOpen(false)}
          />
          <DiditLoginButton
            authMethod={DiditAuthMethod.GOOGLE}
            label="Connect with Didit"
          />
        </div>
      </div>
    </main>
  );
}
