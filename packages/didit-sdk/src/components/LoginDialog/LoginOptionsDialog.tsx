import clsx from 'clsx';
import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditAuthMethod, SocialAuthProvider } from '../../types';
import { DiditButton } from '../DiditButton';
import { DiditError } from '../DiditError';
import DiditConnectWalletButton from '../DiditWalletConnectButton/DiditWalletConnectButton';
import SocialIcon from '../Icons/SocialIcon';
import './Dialog.css';

interface LoginOptionsDialogProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  onLoginWithSocials?: () => void;
  title: string;
  description: string;
}

const LoginOptionsDialog: FC<LoginOptionsDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  description,
  onLoginWithSocials = () => {},
  title,
  wrapperClassName = '',
}) => {
  const { availableAuthMethods, error, hasError, isAuthenticated } =
    useDiditAuth();

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

  const LoginClassName = clsx('dialog-wrapper', wrapperClassName);

  return (
    <div className={LoginClassName} data-testid={dataTestId}>
      <div className="dialog-text">
        <h2 className="dialog-text-title">{title}</h2>
        <p className="dialog-text-description">{description}</p>
      </div>
      <div className="dialog-buttons">
        {/*
        { isEmailAuthAvailable && (
          <DiditButton
            className={buttonClassName}
            icon={<EmailIcon />}
            isDisabled={isAuthenticated}
            label="Continue with Email"
            onClick={loginWithEmail}
          />
        }
                */}
        {isAnySocialAuthAvailable && (
          <DiditButton
            className={buttonClassName}
            icon={<SocialIcon />}
            isDisabled={isAuthenticated}
            label="Continue with a social account"
            onClick={onLoginWithSocials}
          />
        )}
        {isWalletAuthAvailable && <DiditConnectWalletButton />}
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

export default LoginOptionsDialog;
