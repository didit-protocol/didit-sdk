import React from 'react';

interface WelcomeScreenProps {
  setStep: (step: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  setStep,
}) => {

  const handleEmailRegistration = () => {
    setStep('showEmailRegistration');
  };

  const toggleSocialLogin = () => {
    setStep('showSocialLogin');
  };

  const toggleWalletLogin = () => {
    setStep('showWalletLogin');
  };

  return (
    <>
      <h1>Connect with gamium</h1>
      <div className="button-container">
        <button className="popup-button" onClick={handleEmailRegistration}>
          Continue with email
        </button>
        <button className="popup-button" onClick={toggleSocialLogin}>
          Continue with social login
        </button>
        <button className="popup-button" onClick={toggleWalletLogin}>
          Continue with wallet
        </button>
      </div>
    </>
  );
};

export default WelcomeScreen;
