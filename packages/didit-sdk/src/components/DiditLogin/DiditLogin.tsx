import React, { FC } from 'react';
import { DiditLoginMode } from '../../types';
import { LoginDialog } from '../LoginDialog';
import LoginModal from '../LoginModal/LoginModal';

const LOGIN_DIALOG_DEFAULT_TITLE = 'Sign In With Didit';
const LOGIN_DIALOG_DEFAULT_DESCRIPTION = '';

const mode_map = {
  [DiditLoginMode.EMBEDDED]: LoginDialog,
  [DiditLoginMode.MODAL]: LoginModal,
};

interface DiditLoginProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  mode?: DiditLoginMode;
  isModalOpen?: boolean;
  onModalClose?: () => void;
  title?: string;
  description?: string;
}

const DiditLogin: FC<DiditLoginProps> = ({
  buttonClassName = '',
  dataTestId = '',
  description = LOGIN_DIALOG_DEFAULT_DESCRIPTION,
  isModalOpen = false,
  mode = DiditLoginMode.MODAL,
  onModalClose = () => {},
  title = LOGIN_DIALOG_DEFAULT_TITLE,
  wrapperClassName,
}) => {
  const Login = mode_map[mode] || LoginModal;

  return (
    <Login
      buttonClassName={buttonClassName}
      dataTestId={dataTestId}
      description={description}
      isOpen={isModalOpen}
      onClose={onModalClose}
      title={title}
      wrapperClassName={wrapperClassName}
    />
  );
};

export default DiditLogin;
