import React, { FC, ReactNode } from 'react';
import { Box } from '../Box/Box';
import { CloseButton } from '../CloseButton/CloseButton';
import { Dialog } from '../Dialog/Dialog';
import { DialogContent } from '../Dialog/DialogContent';
import { LoginDialog } from '../LoginDialog';

interface LoginModalProps {
  wrapperClassName?: string;
  buttonClassName?: string;
  dataTestId?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  header: ReactNode;
  footer: ReactNode;
}

const LoginModal: FC<LoginModalProps> = ({
  buttonClassName = '',
  dataTestId = '',
  description,
  footer = null,
  header = null,
  isOpen = false,
  onClose = () => {},
  title,
  wrapperClassName = '',
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
          <LoginDialog
            buttonClassName={buttonClassName}
            dataTestId={dataTestId}
            description={description}
            footer={footer}
            header={header}
            title={title}
            wrapperClassName={wrapperClassName}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
