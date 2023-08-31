import React from 'react';
import {
  ResponsiveValue
} from '../../css/sprinkles.css';
import { touchableStyles } from '../../css/touchableStyles';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { Box } from '../Box/Box';
import PermissionListComponent from '../ConnectOptions/screens/Permissions';
import SuccessComponent from '../ConnectOptions/screens/SuccessComponent';
import { useAuthenticationStatus } from '../RainbowKitProvider/AuthenticationContext';
import { useRainbowKitChains } from '../RainbowKitProvider/RainbowKitChainContext';
import { ConnectButtonRenderer } from './ConnectButtonRenderer';

const permissionsData = [
  { id: 1, text: 'Email', authorized: false },
  { id: 2, text: 'Profile Information', authorized: false },
  { id: 3, text: 'Contacts', authorized: false },
  // Add more items as needed
];

type AccountStatus = 'full' | 'avatar' | 'address';
type ChainStatus = 'full' | 'icon' | 'name' | 'none';

export interface ConnectButtonProps {
  accountStatus?: ResponsiveValue<AccountStatus>;
  showBalance?: ResponsiveValue<boolean>;
  chainStatus?: ResponsiveValue<ChainStatus>;
  label?: string;
}

const defaultProps = {
  accountStatus: 'full',
  chainStatus: { largeScreen: 'full', smallScreen: 'icon' },
  label: 'Connect To Gamium',
  showBalance: { largeScreen: true, smallScreen: false },
} as const;

export function ConnectButton({
  accountStatus = defaultProps.accountStatus,
  chainStatus = defaultProps.chainStatus,
  label = defaultProps.label,
  showBalance = defaultProps.showBalance,
}: ConnectButtonProps) {
  const chains = useRainbowKitChains();
  const connectionStatus = useConnectionStatus();
  const authenticationStatus = useAuthenticationStatus();

  return (
    <ConnectButtonRenderer>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && connectionStatus !== 'loading';
        const unsupportedChain = chain?.unsupported ?? false;
        // FETCH API BACKEND FOR terms and conditions  useEffect
        const [step, setStep] = React.useState('showTerms');
        const [permissions, setPermissions] = React.useState<any>(permissionsData);
        
    


        const handleContinue = () => {
          setStep('showPermissions');
        }

        const togglePermission = (permissionId: any) => {
          const updatedPermissions = permissions.map((permission: { id: any; authorized: any; }) =>
            permission.id === permissionId
              ? { ...permission, authorized: !permission.authorized }
              : permission
          );
          setPermissions(updatedPermissions);
        };



        return (
          <Box
            display="flex"
            gap="12"
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {authenticationStatus === 'authenticated' ? (
              <>
                  <div className="popup">
                    {step ===  "showTerms" ? <SuccessComponent handleContinue={handleContinue} />
                    : <PermissionListComponent 
                    permissions={permissions}
                    togglePermission={togglePermission}                
                    />}
                  </div>
              </>
            ) : (
              <Box
                as="button"
                background="accentColor"
                borderRadius="connectButton"
                boxShadow="connectButton"
                className={touchableStyles({ active: 'shrink', hover: 'grow' })}
                color="accentColorForeground"
                fontFamily="body"
                fontWeight="bold"
                height="40"
                key="connect"
                onClick={openConnectModal}
                paddingX="14"
                testId="connect-button"
                transition="default"
                type="button"
              >
                {label}
              </Box>
            )}
          </Box>
        );
      }}
    </ConnectButtonRenderer>
  );
}

ConnectButton.__defaultProps = defaultProps;
ConnectButton.Custom = ConnectButtonRenderer;
