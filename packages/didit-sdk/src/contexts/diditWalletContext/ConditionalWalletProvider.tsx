import React from 'react';
import {
  DiditWalletProvider,
  DiditWalletProviderProps,
} from './DiditWalletProvider';

interface ConditionalWalletProviderProps {
  useWalletProvider: boolean;
}

type ConditionalWalletProviderPropsType = ConditionalWalletProviderProps &
  DiditWalletProviderProps;
export function ConditionalWalletProvider({
  children,
  useWalletProvider = false,
  ...restProps
}: ConditionalWalletProviderPropsType) {
  if (useWalletProvider === true) {
    return <DiditWalletProvider {...restProps}>{children}</DiditWalletProvider>;
  }
  return <>{children}</>;
}
