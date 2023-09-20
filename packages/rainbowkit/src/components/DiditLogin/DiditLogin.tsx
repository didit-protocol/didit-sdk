import clsx from 'clsx';
import React, { FC } from 'react';
import LoginEmbedded from '../LoginEmbedded/LoginEmbedded';
import LoginModal from '../LoginModal/LoginModal';

const mode_map = {
  embedded: LoginEmbedded,
  modal: LoginModal,
};

interface DiditLoginProps {
  className?: string;
  dataTestId?: string;
  mode?: 'modal' | 'embedded';
  isModalOpen?: boolean;
  onModalClose?: () => void;
}

const DiditLoginModal: FC<DiditLoginProps> = ({
  className = '',
  dataTestId = '',
  isModalOpen = false,
  mode = 'modal',
  onModalClose = () => {},
}) => {
  const diditLoginClassName = clsx(className);
  const Login = mode_map[mode] || LoginModal;

  return (
    <div className={diditLoginClassName} data-testid={dataTestId}>
      <b>{`Didit login component - ${mode}`}</b>
      <Login isOpen={isModalOpen} onClose={onModalClose} />
    </div>
  );
};

export default DiditLoginModal;
