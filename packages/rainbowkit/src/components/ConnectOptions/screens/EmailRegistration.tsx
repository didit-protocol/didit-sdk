import React from 'react';

interface EmailRegistrationProps {
  handleAccountCreation: () => void;
}

const EmailRegistrationComponent: React.FC<EmailRegistrationProps> = ({
  handleAccountCreation,
}) => {
  {console.log("ACCOUNT", handleAccountCreation)}
  return (
    <div className="email-registration-content">
      <h1>Register to didit</h1>
      <div className="input-container">
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Repeat Password" />
      </div>
      <button className="popup-button" onClick={handleAccountCreation}>
        Create Account
      </button>
    </div>
  );
};

export default EmailRegistrationComponent;
