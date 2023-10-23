import clsx from 'clsx';
import React, { FC } from 'react';
import { DiditButton } from '../DiditButton';
import { DiditError } from '../DiditError';
import AppleIcon from '../Icons/AppleIcon';
import FacebookIcon from '../Icons/FacebookIcon';
import GoogleIcon from '../Icons/GoogleIcon';
import TwitterIcon from '../Icons/TwitterIcon';
import './Dialog.css';
import LeftArrowButton from '../LeftArrowButton/LeftArrowButton';

interface SocialOptionsDialogProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  hasError?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  onBackClick?: () => void;
}

const SocialOptionsDialog: FC<SocialOptionsDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  errorDescription = '',
  errorTitle = '',
  hasError = false,
  onBackClick = () => {},
  wrapperClassName = '',
}) => {
  const LoginClassName = clsx('dialog-wrapper', wrapperClassName);

  return (
    <div className={LoginClassName} data-testid={dataTestId}>
      <div className="dialog-text">
        <div className="dialog-header">
          <LeftArrowButton onClick={onBackClick} />
          <h2 className="dialog-text-title">Select social account</h2>
        </div>
        <p className="dialog-text-description">
          This paragraph of text is used to describe data and suggest the user
          to fill in the fields.
        </p>
      </div>
      <div className="dialog-buttons">
        <DiditButton
          className={buttonClassName}
          icon={<GoogleIcon />}
          label="Continue with Email"
          onClick={() => {}}
        />
        <DiditButton
          className={buttonClassName}
          icon={<AppleIcon />}
          label="Continue with Social"
          onClick={() => {}}
        />
        <DiditButton
          className={buttonClassName}
          icon={<TwitterIcon />}
          label="Continue with Social"
          onClick={() => {}}
        />
        <DiditButton
          className={buttonClassName}
          icon={<FacebookIcon />}
          label="Continue with Social"
          onClick={() => {}}
        />
      </div>
      <div className="dialog-error">
        <DiditError
          description={errorDescription}
          isHidden={hasError}
          title={errorTitle}
        />
      </div>
    </div>
  );
};

export default SocialOptionsDialog;
