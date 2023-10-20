import React, { FC } from 'react';
import { Box } from '../Box/Box';
import { CloseButton } from '../CloseButton/CloseButton';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { LoginDialog } from '../LoginDialog';

interface LoginModalProps {
  className?: string;
  dataTestId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: FC<LoginModalProps> = ({
  className = '',
  dataTestId = '',
  isOpen = false,
  onClose = () => {},
}) => {
  return (
    <Dialog onClose={onClose} open={isOpen} titleId="login-modal">
      <DialogContent padding="20">
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          gap="10"
          justifyContent="space-between"
          width="full"
        >
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
            width="full"
          >
            <CloseButton onClose={onClose} />
          </Box>
          <LoginDialog className={className} dataTestId={dataTestId} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
