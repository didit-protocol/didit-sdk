import clsx from 'clsx';
import React, { FC } from 'react';
import { DiditButton } from '../DiditButton';
import { DiditError } from '../DiditError';
import { DiditWalletConnectButton } from '../DiditWalletConnectButton';
import { EmailIcon } from '../Icons/Email';
import './Dialog.css';
import SocialIcon from '../Icons/SocialIcon';

interface LoginOptionsDialogProps {
  className?: string;
  dataTestId?: string;
  hasError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onLoginWithSocials?: () => void;
}

const LoginOptionsDialog: FC<LoginOptionsDialogProps> = ({
  className = '',
  dataTestId = '',
  errorDescription = '',
  errorTitle = '',
  hasError = false,
  onLoginWithSocials = () => {},
}) => {
  const LoginClassName = clsx('dialog-wrapper', className);

  return (
    <div className={LoginClassName} data-testid={dataTestId}>
      <div className="dialog-text">
        <h2 className="dialog-text-title">Welcome back to Didit Profile</h2>
        <p className="dialog-text-description">
          This paragraph of text is used to describe data and suggest the user
          to fill in the fields.
        </p>
      </div>
      <div className="dialog-buttons">
        <DiditButton icon={<EmailIcon />} label="Continue with Email" />
        <DiditButton
          icon={<SocialIcon />}
          label="Continue with Social"
          onClick={onLoginWithSocials}
        />
        <DiditWalletConnectButton />
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
