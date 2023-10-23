import React, { FC } from 'react';
import { LoginDialog } from '../LoginDialog';
import LoginModal from '../LoginModal/LoginModal';

const mode_map = {
  embedded: LoginDialog,
  modal: LoginModal,
};

interface DiditLoginProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  mode?: 'modal' | 'embedded';
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

const DiditLogin: FC<DiditLoginProps> = ({
  buttonClassName = '',
  dataTestId = '',
  isModalOpen = false,
  mode = 'modal',
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
