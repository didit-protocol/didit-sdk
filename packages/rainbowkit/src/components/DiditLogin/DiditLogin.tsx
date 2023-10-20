import clsx from 'clsx';
import React, { FC } from 'react';
import { LoginDialog } from '../LoginDialog';
import LoginModal from './LoginModal';

const mode_map = {
  embedded: LoginDialog,
  modal: LoginModal,
};

interface DiditLoginProps {
  className?: string;
  dataTestId?: string;
  mode?: 'modal' | 'embedded';
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

const DiditLogin: FC<DiditLoginProps> = ({
  className = '',
  dataTestId = '',
  isModalOpen = false,
  mode = 'modal',
  onModalClose = () => {},
}) => {
  const diditLoginClassName = clsx(className);
  const Login = mode_map[mode] || LoginModal;

  return (
    <Login
      className={diditLoginClassName}
      dataTestId={dataTestId}
      isOpen={isModalOpen}
      onClose={onModalClose}
    />
  );
};

export default DiditLogin;
