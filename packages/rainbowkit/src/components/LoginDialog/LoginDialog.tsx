import React, { FC, useCallback, useState } from 'react';
// import LeftArrowButton from '../LeftArrowButton/LeftArrowButton';
import LoginOptionsDialog from './LoginOptionsDialog';
import SocialOptionsDialog from './SocialOptionsDialog';

interface LoginDialogProps {
  className?: string;
  dataTestId?: string;
}
const LoginDialog: FC<LoginDialogProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const [isSocialOptionsDialog, setIsSocialOptionsDialog] = useState(false);

  const HandleLoginWithSocials = useCallback(() => {
    setIsSocialOptionsDialog(true);
  }, []);

  const handlBackToLoginOptions = useCallback(() => {
    setIsSocialOptionsDialog(false);
  }, []);

  return (
    <>
      {/* <LeftArrowButton onClick={handlBackToLoginOptions} /> */}
      {isSocialOptionsDialog ? (
        <SocialOptionsDialog
          className={className}
          dataTestId={dataTestId}
          onBackClick={handlBackToLoginOptions}
        />
      ) : (
        <LoginOptionsDialog
          className={className}
          dataTestId={dataTestId}
          errorDescription="Please try again later"
          errorTitle="Opps something went wrong"
          hasError={false}
          onLoginWithSocials={HandleLoginWithSocials}
        />
      )}
    </>
  );
};

export default LoginDialog;
