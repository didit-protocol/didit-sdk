import React from 'react';
import { DiditLogin } from 'didit-sdk';

const ModalLoginView = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Modal Login View</h1>
      <div>
        <button onClick={() => setIsLoginModalOpen(true)}>
          Open Login Modal
        </button>
        <DiditLogin
          mode="modal"
          isModalOpen={isLoginModalOpen}
          onModalClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ModalLoginView;
