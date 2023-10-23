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
  return (
    <button
      className={`${className} didit-button`}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={onClick}
      type="button"
    >
      <span className="didit-button-icon">{icon}</span>
      <span className="didit-button-text">{label}</span>
      <span style={{ hieght: '16px', width: '16px' }} />
    </button>
  );
}
