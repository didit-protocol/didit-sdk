import { CodeResponse, useGoogleLogin } from "@react-oauth/google";
import React from 'react';
import AppleLogin from 'react-apple-login';
import { useAuthenticationAdapter } from '../../RainbowKitProvider/AuthenticationContext';
import '../App.css';



interface SocialLoginProps {
  onClose: () => void;
}


const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  onClose,
}) => {
  const googleLogin = useGoogleLogin({
    onSuccess: (response: CodeResponse) => {
      console.log(response)
      authAdapter.callbackGoogle(response.code)
      onClose()
   },
  flow: 'auth-code'},
  );

  const authAdapter = useAuthenticationAdapter();


  return (
    <div className="social-login-content">
      <h2>Connect with Social Login</h2>
      <div className="button-container">
        <button className="popup-button" onClick={() => googleLogin()}>Connect with Google</button>
        <AppleLogin
        clientId="com.example.dedede"
        scope="email name"
        redirectURI="https://docs.didit.me/"
        responseType="code id_token"
        responseMode="form_post"
        render={renderProps => (  //Custom Apple Sign in Button
                  <button
                    onClick={renderProps.onClick}
                    className="popup-button"
                      >
                    Continue with Apple
                  </button>
                    )}
      />
      </div>
    </div>
  );
};

export default SocialLoginComponent;
