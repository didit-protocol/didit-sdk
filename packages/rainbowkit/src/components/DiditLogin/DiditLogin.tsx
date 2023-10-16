import clsx from 'clsx';
import { SocialAuthProvider, useDiditEmailAuthContext } from 'didit-provider';
import React, { FC } from 'react';

interface DiditLoginProps {
  className?: string;
  dataTestId?: string;
}

const DiditLogin: FC<DiditLoginProps> = ({
  className = '',
  dataTestId = '',
}) => {
  const { login } = useDiditEmailAuthContext();

  const connectWithGoogle = () => login(SocialAuthProvider.GOOGLE);

  const diditLoginClassName = clsx(className);

  return (
    <div className={diditLoginClassName} data-testid={dataTestId}>
      <button onClick={connectWithGoogle} type="button">
        Connect with Google
      </button>
    </div>
  );
};

export default DiditLogin;
