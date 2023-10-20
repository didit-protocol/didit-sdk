import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditButton } from '../DiditButton';

interface DiditLogoutButtonProps {
  className?: string;
  dataTestId?: string;
}

const DiditLogoutButton: FC<DiditLogoutButtonProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { logout } = useDiditAuth();

  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      label="Logout"
      onClick={logout}
    />
  );
};

export default DiditLogoutButton;
