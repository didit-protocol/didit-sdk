import React, { FC } from 'react';
import { DiditLoginMode } from '../../types';
import { LoginDialog } from '../LoginDialog';
import LoginModal from '../LoginModal/LoginModal';

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
}

const DiditLogin: FC<DiditLoginProps> = ({
  buttonClassName = '',
  dataTestId = '',
  isModalOpen = false,
  mode = DiditLoginMode.MODAL,
  onModalClose = () => {},
  wrapperClassName = '',
}) => {
  const Login = mode_map[mode] || LoginModal;

  return (
    <Login
      buttonClassName={buttonClassName}
      dataTestId={dataTestId}
      isOpen={isModalOpen}
      onClose={onModalClose}
      wrapperClassName={wrapperClassName}
    />
  );
};

export default DiditLogin;
