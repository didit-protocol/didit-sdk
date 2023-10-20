import React from 'react';
import './DiditButton.css';

interface DiditButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  dataTestId?: string;
}

export function DiditButton({
  className = '',
  dataTestId = '',
  icon = null,
  label,
  onClick = () => {},
}: DiditButtonProps) {
  return (
    <button
      className={`${className} didit-button`}
      data-testid={dataTestId}
      onClick={onClick}
      type="button"
    >
      <span className="didit-button-icon">{icon}</span>
      <span className="didit-button-text">{label}</span>
      <span style={{ hieght: '16px', width: '16px' }} />
    </button>
  );
}
