import clsx from 'clsx';
import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditAuthMethod } from '../../types';
import { DiditButton } from '../DiditButton';
import GoogleIcon from '../Icons/GoogleIcon';
import './Dialog.css';
import LeftArrowButton from '../LeftArrowButton/LeftArrowButton';

interface SocialOptionsDialogProps {
  className?: string;
  dataTestId?: string;
  onBackClick?: () => void;
}

const SocialOptionsDialog: FC<SocialOptionsDialogProps> = ({
  className = '',
  dataTestId = '',
  onBackClick = () => {},
}) => {
  const { availableAuthMethods, loginWithGoogle } = useDiditAuth();

  const isGoogleAuthAvailable = availableAuthMethods.includes(
    DiditAuthMethod.GOOGLE
  );
  // const isAppleAuthAvailable = availableAuthMethods.includes(
  //   DiditAuthMethod.APPLE
  // );

  const LoginClassName = clsx('dialog-wrapper', className);

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
            icon={<GoogleIcon />}
            label="Continue with Google"
            onClick={loginWithGoogle}
          />
        )}
        {/*
        { isAppleAuthAvailable && (
          <DiditButton
            icon={<GoogleIcon />}
            label="Continue with Google"
            onClick={loginWithApple}
          />
        )}
        } 
        */}
      </div>
    </div>
  );
};

export default SocialOptionsDialog;
