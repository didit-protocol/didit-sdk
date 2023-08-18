import React from 'react';

interface WalletLoginProps {
  handleAccountCreation: () => void;
}

const WalletLoginComponent: React.FC<WalletLoginProps> = ({
  handleAccountCreation,
}) => {
  return (
    <div className="wallet-login-content">
      <h2>Connect with Wallet</h2>
      <div className="button-container">
        <button className="popup-button" onClick={handleAccountCreation}>
          Connect with MetaMask
        </button>
        <button className="popup-button" onClick={handleAccountCreation}>
          Connect with Coinbase
        </button>
        <button className="popup-button" onClick={handleAccountCreation}>
          Connect with WalletConnect
        </button>
      </div>
    </div>
  );
};

export default WalletLoginComponent;
