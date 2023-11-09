import React, { FC } from 'react';
import { useDiditAuth } from '../../hooks';
import { DiditButton } from '../DiditButton';

interface DiditLogoutButtonProps {
  className?: string;
  dataTestId?: string;
  label?: string;
}

const DiditLogoutButton: FC<DiditLogoutButtonProps> = ({
  className = '',
  dataTestId = '',
  label = 'Logout',
}) => {
  const { isAuthenticated, logout } = useDiditAuth();

  return (
    <DiditButton
      className={className}
      dataTestId={dataTestId}
      isDisabled={isAuthenticated !== true} // Authenticated or loading
      label={label}
      onClick={logout}
    />
  );
};

export default DiditLogoutButton;
