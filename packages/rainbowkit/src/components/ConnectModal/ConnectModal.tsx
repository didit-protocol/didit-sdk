import React from 'react';
import { useDisconnect } from 'wagmi';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import ConnectOptions from '../ConnectOptions/ConnectOptions';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { SignIn } from '../SignIn/SignIn';
export interface ConnectModalProps {
  open: boolean;
  onClose: () => void;
}

export function ConnectModal({ onClose, open }: ConnectModalProps) {
  const titleId = 'rk_connect_title';
  const connectionStatus = useConnectionStatus();
  const { disconnect } = useDisconnect();
  const closeDisconnect = () => {
    onClose();
    disconnect();
  };

  if (connectionStatus === 'disconnected') {
    return (
      <Dialog onClose={closeDisconnect} open={open} titleId={titleId}>
        <DialogContent bottomSheetOnMobile padding="0" wide>
          <ConnectOptions onClose={closeDisconnect} />
        </DialogContent>
      </Dialog>
    );
  }

  if (connectionStatus === 'unauthenticated') {
    return (
      <Dialog onClose={closeDisconnect} open={open} titleId={titleId}>
        <DialogContent bottomSheetOnMobile padding="0">
          <SignIn onClose={closeDisconnect} />
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
