import React from 'react';

interface EmailRegistrationProps {
  handleAccountCreation: () => void;
}

const EmailRegistrationComponent: React.FC<EmailRegistrationProps> = ({
  handleAccountCreation,
}) => {
  return (
    <iframe
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms"
          allow="camera 'src'; magnetometer 'none'; microphone 'none';
          geolocation 'none'; display-capture 'none'; forms"
           src={`${process.env.REACT_APP_EMAIL_AUTH_URL}/accounts/login`}
           width="800px"
           height="600px"
       >
       </iframe>
  );
};

export default EmailRegistrationComponent;
