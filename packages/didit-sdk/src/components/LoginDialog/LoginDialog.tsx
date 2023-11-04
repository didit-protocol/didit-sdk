import React, { FC, useCallback, useState } from 'react';
// import LeftArrowButton from '../LeftArrowButton/LeftArrowButton';
import LoginOptionsDialog from './LoginOptionsDialog';
import SocialOptionsDialog from './SocialOptionsDialog';

interface LoginDialogProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  title: string;
  description: string;
}
const LoginDialog: FC<LoginDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  description = '',
  title,
  wrapperClassName,
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
          buttonClassName={buttonClassName}
          dataTestId={dataTestId}
          onBackClick={handlBackToLoginOptions}
          wrapperClassName={wrapperClassName}
        />
      ) : (
        <LoginOptionsDialog
          buttonClassName={buttonClassName}
          dataTestId={dataTestId}
          description={description}
          onLoginWithSocials={HandleLoginWithSocials}
          title={title}
          wrapperClassName={wrapperClassName}
        />
      )}
    </>
  );
};

export default LoginDialog;
