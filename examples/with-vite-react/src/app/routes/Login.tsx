import { useState } from 'react';
import { DiditLogin, DiditLoginMode } from 'didit-sdk';

export default function DiditLoginPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <DiditLogin mode={DiditLoginMode.EMBEDDED} />
      <button onClick={() => setIsLoginModalOpen(true)}>
        open login modal
      </button>
      <DiditLogin
        mode={DiditLoginMode.MODAL}
        isModalOpen={isLoginModalOpen}
        onModalClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
