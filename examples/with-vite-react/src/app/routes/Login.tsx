import { useState } from 'react';
import { DiditLogin } from 'didit-sdk';

export default function DiditLoginPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div>
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
  );
}
