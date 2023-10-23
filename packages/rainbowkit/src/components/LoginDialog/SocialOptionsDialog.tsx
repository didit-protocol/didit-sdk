import clsx from 'clsx';
import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditAuthMethod } from '../../types';
import { DiditButton } from '../DiditButton';
import { DiditError } from '../DiditError';
import GoogleIcon from '../Icons/GoogleIcon';
import './Dialog.css';
import LeftArrowButton from '../LeftArrowButton/LeftArrowButton';

interface SocialOptionsDialogProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  onBackClick?: () => void;
}

const SocialOptionsDialog: FC<SocialOptionsDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  onBackClick = () => {},
  wrapperClassName = '',
}) => {
  const {
    availableAuthMethods,
    error,
    hasError,
    isAuthenticated,
    loginWithGoogle,
  } = useDiditAuth();

  const isGoogleAuthAvailable = availableAuthMethods.includes(
    DiditAuthMethod.GOOGLE
  );
  // const isAppleAuthAvailable = availableAuthMethods.includes(
  //   DiditAuthMethod.APPLE
  // );

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
        {isGoogleAuthAvailable && (
          <DiditButton
            className={buttonClassName}
            icon={<GoogleIcon />}
            isDisabled={isAuthenticated}
            label="Continue with Google"
            onClick={loginWithGoogle}
          />
        )}
        {/*
        { isAppleAuthAvailable && (
          <DiditButton
            className={buttonClassName}
            icon={<GoogleIcon />}
            isDisabled={isAuthenticated}
            label="Continue with Google"
            onClick={loginWithApple}
          />
        )}
        } 
        */}
      </div>
      <div className="dialog-error">
        <DiditError
          description={error || ''}
          isHidden={!hasError}
          title="Opps something went wrong"
        />
      </div>
    </div>
  );
};

export default SocialOptionsDialog;
