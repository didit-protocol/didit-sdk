import clsx from 'clsx';
import React, { FC } from 'react';
import { DiditButton } from '../DiditButton';
import { DiditError } from '../DiditError';
import { DiditWalletConnectButton } from '../DiditWalletConnectButton';
import { EmailIcon } from '../Icons/Email';
import './Dialog.css';
import SocialIcon from '../Icons/SocialIcon';

interface LoginOptionsDialogProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  hasError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onLoginWithSocials?: () => void;
}

const LoginOptionsDialog: FC<LoginOptionsDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  errorDescription = '',
  errorTitle = '',
  hasError = false,
  onLoginWithSocials = () => {},
  wrapperClassName = '',
}) => {
  const LoginClassName = clsx('dialog-wrapper', wrapperClassName);

  return (
    <div className={LoginClassName} data-testid={dataTestId}>
      <div className="dialog-text">
        <h2 className="dialog-text-title">Sign In With Didit</h2>
        <p className="dialog-text-description">
          This paragraph of text is used to describe data and suggest the user
          to fill in the fields.
        </p>
      </div>
      <div className="dialog-buttons">
        <DiditButton
          className={buttonClassName}
          icon={<EmailIcon />}
          label="Continue with Email"
        />
        <DiditButton
          className={buttonClassName}
          icon={<SocialIcon />}
          label="Continue with Social"
          onClick={onLoginWithSocials}
        />
        <DiditWalletConnectButton className={buttonClassName} />
      </div>
      <div className="dialog-error">
        <DiditError
          description={errorDescription}
          isHidden={!hasError}
          title={errorTitle}
        />
      </div>
    </div>
  );
};

export default LoginOptionsDialog;
