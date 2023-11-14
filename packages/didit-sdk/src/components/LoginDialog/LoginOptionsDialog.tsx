import clsx from 'clsx';
import React, { FC, ReactNode } from 'react';
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
  header?: ReactNode;
  footer?: ReactNode;
}

const LoginOptionsDialog: FC<LoginOptionsDialogProps> = ({
  buttonClassName = '',
  dataTestId = '',
  description,
  footer = null,
  header = null,
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
      {header ? (
        header
      ) : (
        <div className="dialog-text">
          <h2 className="dialog-text-title">{title}</h2>
          <p className="dialog-text-description">{description}</p>
        </div>
      )}
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
            label="Continue with Social Account"
            onClick={onLoginWithSocials}
          />
        )}
        {isWalletAuthAvailable && <DiditConnectWalletButton />}
      </div>
      {hasError && (
        <div className="dialog-error">
          <DiditError
            description={error || ''}
            title="Opps something went wrong"
          />
        </div>
      )}
      {footer}
    </div>
  );
};

export default LoginOptionsDialog;
