import React from 'react';
import { GoogleLogin } from '@react-oauth/google';


interface SocialLoginProps {
  handleAccountCreation: () => void;
}

const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  handleAccountCreation,
}) => {
  return (
    <div className="social-login-content">
      <h2>Connect with Social Login</h2>
      <div className="button-container">
      <GoogleLogin
            className="popup-button"
              onError={() => {
                throw new Error('Wrong Login');
              }}
              onSuccess={(response: { credential: any }) =>
              {
                // eslint-disable-next-line no-console
                console.log('tokenId', response.credential)
                handleAccountCreation()
                console.log("RUN")
              }}
            />
        <button className="popup-button" onClick={handleAccountCreation}>
          Connect with Apple
        </button>
      </div>
    </div>
  );
};

export default SocialLoginComponent;
