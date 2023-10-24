import clsx from 'clsx';
import React from 'react';
import './DiditButton.css';

interface DiditButtonProps {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  isDisabled?: boolean;
  dataTestId?: string;
  onClick?: () => void;
}

export function DiditButton({
  className = '',
  dataTestId = '',
  icon = null,
  isDisabled = false,
  label,
  onClick = () => {},
}: DiditButtonProps) {
  const buttonClassName = clsx('didit-button', className);
  return (
    <button
      className={buttonClassName}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={onClick}
      type="button"
    >
      {!!icon && <span className="didit-button-icon">{icon}</span>}
      <span className="didit-button-text">{label}</span>
    </button>
  );
}
