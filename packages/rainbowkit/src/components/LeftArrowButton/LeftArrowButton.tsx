import clsx from 'clsx';
import React from 'react';
import LeftArrowIcon from '../Icons/LeftArrowIcon';
import './LeftArrowButton.css';

interface LeftArrowButtonProps {
  className?: string;
  dataTestId?: string;
  onClick?: () => void;
}

const LeftArrowButton = ({
  className = '',
  dataTestId = '',
  onClick = () => {},
}: LeftArrowButtonProps) => {
  const LeftArrowButtonClassName = clsx('left-arrow-button', className);
  return (
    <button
      className={LeftArrowButtonClassName}
      data-testid={dataTestId}
      onClick={onClick}
      type="button"
    >
      <LeftArrowIcon />
    </button>
  );
};

export default LeftArrowButton;
