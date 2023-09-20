import React, { FC } from 'react';
import { Box } from '../Box/Box';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { CloseIcon } from '../Icons/Close';
import Login from '../Login/Login';

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
    <Box
      borderColor="accentColor"
      className={className}
      padding="20"
      testId={dataTestId}
    >
      <Dialog onClose={onClose} open={isOpen} titleId="login-modal">
        <DialogContent>
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
              <Box onClick={onClose} padding="10">
                <CloseIcon />
              </Box>
            </Box>
            <Login />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoginModal;
