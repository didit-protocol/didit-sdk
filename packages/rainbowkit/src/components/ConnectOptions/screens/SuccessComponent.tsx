
import React from 'react';

interface SuccessProps {
  handleContinue: () => void;
}

const SuccessComponent: React.FC<SuccessProps> = ({ handleContinue }) => {
  return (
    <div className="success-content">
      <div className="success-icon">✔️</div>
      <p>Account created.</p>
      <button className="popup-button" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};

export default SuccessComponent;
