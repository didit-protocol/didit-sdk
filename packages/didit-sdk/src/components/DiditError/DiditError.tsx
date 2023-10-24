import clsx from 'clsx';
import React from 'react';
import './DiditError.css';

interface DiditErrorProps {
  title: string;
  description: string;
  isHidden?: boolean;
  className?: string;
  dataTestId?: string;
}

export default function DiditError({
  className = '',
  dataTestId = '',
  description,
  isHidden = true,
  title,
}: DiditErrorProps) {
  if (isHidden) return null;

  const diditErrorClassName = clsx('didit-error-wrapper', className);

  return (
    <div className={diditErrorClassName} data-testid={dataTestId}>
      <p className="didit-error-title">{title}</p>
      <p className="didit-error-description">{description}</p>
    </div>
  );
}
