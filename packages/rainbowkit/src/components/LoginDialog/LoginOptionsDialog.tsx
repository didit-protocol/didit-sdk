import clsx from 'clsx';
import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditAuthMethod, SocialAuthProvider } from '../../types';
import { DiditButton } from '../DiditButton';
import { DiditWalletConnect } from '../DiditWalletConnect';
import './Dialog.css';
import SocialIcon from '../Icons/SocialIcon';

interface LoginOptionsDialogProps {
  className?: string;
  dataTestId?: string;
  onLoginWithSocials?: () => void;
}

const LoginOptionsDialog: FC<LoginOptionsDialogProps> = ({
  className = '',
  dataTestId = '',
  onLoginWithSocials = () => {},
}) => {
  const { availableAuthMethods, isAuthenticated } = useDiditAuth();

  // const isEmailAuthAvailable = availableAuthMethods.includes(
  //   DiditAuthMethod.EMAIL
  // );
  const isAnySocialAuthAvailable = Object.values(SocialAuthProvider).some(
    _socialAuthMethod =>
      availableAuthMethods.includes(
        _socialAuthMethod as unknown as DiditAuthMethod
      )
  );
  const isWalletAuthAvailable = availableAuthMethods.includes(
    DiditAuthMethod.WALLET
  );

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
        {/*
        { isEmailAuthAvailable && (
          <DiditButton 
            icon={<EmailIcon />} 
            isDisabled={isAuthenticated}
            label="Continue with Email" 
            onClick={loginWithEmail}
          />
        } 
                */}
        {isAnySocialAuthAvailable && (
          <DiditButton
            icon={<SocialIcon />}
            isDisabled={isAuthenticated}
            label="Continue with a social account"
            onClick={onLoginWithSocials}
          />
        )}
        {isWalletAuthAvailable && <DiditWalletConnect />}
      </div>
    </div>
  );
};

export default LoginOptionsDialog;
