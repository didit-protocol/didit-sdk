import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AppleLogin from 'react-apple-login';
import { useAuthenticationAdapter } from '../../RainbowKitProvider/AuthenticationContext';



interface SocialLoginProps {
  onClose: () => void;
}

const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  onClose,
}) => {
  const authAdapter = useAuthenticationAdapter();


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
                authAdapter.exchangeToken(response.credential)
                onClose()
              }}
            />
      <AppleLogin
        clientId="me.didit.app"
        redirectURI="https://example-app.com/redirect"
        responseType="code id_token"
        responseMode="form_post"
      />
      </div>
    </div>
  );
};

export default SocialLoginComponent;
