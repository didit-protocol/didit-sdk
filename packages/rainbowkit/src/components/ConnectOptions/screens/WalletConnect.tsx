import React, { Fragment } from 'react';
import { Box } from '../..//Box/Box';
import { Text } from '../../Text/Text';
import { BackIcon } from '../../Icons/Back';
import { CloseButton } from '../../CloseButton/CloseButton';
import { ModalSelection } from '../../ModalSelection/ModalSelection';
import {
    WalletConnector,
  } from '../../../wallets/useWalletConnectors';
import { InfoButton } from '../../InfoButton/InfoButton';
import { ScrollClassName } from '../DesktopOptions.css';
import { DisclaimerLink } from '../../Disclaimer/DisclaimerLink';
import { DisclaimerText } from '../../Disclaimer/DisclaimerText';
import { touchableStyles } from '../../../css/touchableStyles';

export enum WalletStep {
    None = 'NONE',
    LearnCompact = 'LEARN_COMPACT',
    Get = 'GET',
    Connect = 'CONNECT',
    DownloadOptions = 'DOWNLOAD_OPTIONS',
    Download = 'DOWNLOAD',
    InstructionsMobile = 'INSTRUCTIONS_MOBILE',
    InstructionsExtension = 'INSTRUCTIONS_EXTENSION',
  }


interface WalletConnectComponentProps {
    compactModeEnabled: boolean;
    walletStep: WalletStep;
    WalletStep: typeof WalletStep; // Make sure WalletStep enum is imported or defined
    disclaimer: any; // Replace with the actual type of your disclaimer
    onClose: () => void;
    changeWalletStep: (newWalletStep: WalletStep, isBack: boolean) => void;
    selectedOptionId: string | undefined;
    selectWallet: (wallet: WalletConnector) => void; // Replace with the actual type of WalletConnector
    groupedWallets: { [groupName: string]: WalletConnector[] };
    headerBackButtonLink: WalletStep | null;
    headerBackButtonCallback?: () => void;
    headerLabel: string | false | null | undefined
    walletContent: React.ReactNode;
  }

  const titleId = 'rk_connect_title';


  export function WalletConnectComponent({
    compactModeEnabled,
    walletStep,
    WalletStep,
    disclaimer,
    onClose,
    changeWalletStep,
    selectedOptionId,
    selectWallet,
    groupedWallets,
    headerBackButtonLink,
    headerBackButtonCallback,
    headerLabel,
    walletContent,
  }: WalletConnectComponentProps) {
  return (
    <Box
      display="flex"
      flexDirection="row"
      style={{ maxHeight: compactModeEnabled ? 468 : 504 }}
    >
      {(compactModeEnabled ? walletStep === WalletStep.None : true) && (
        <Box
          className={compactModeEnabled ? 'sidebarCompactMode' : 'sidebar'}
          display="flex"
          flexDirection="column"
          marginTop="16"
        >
          <Box display="flex" justifyContent="space-between">
            {compactModeEnabled && disclaimer && (
              <Box marginLeft="16" width="28">
                <InfoButton
                  onClick={() => changeWalletStep(WalletStep.LearnCompact, false)}
                />
              </Box>
            )}
            {compactModeEnabled && !disclaimer && (
              <Box marginLeft="16" width="28" />
            )}
            <Box
              marginLeft={compactModeEnabled ? '0' : '6'}
              paddingBottom="8"
              paddingTop="2"
              paddingX="18"
            >
              <Text
                as="h1"
                color="modalText"
                id={titleId}
                size="18"
                weight="heavy"
              >
                Connect a Wallet
              </Text>
            </Box>
            {compactModeEnabled && (
              <Box marginRight="16">
                <CloseButton onClose={onClose} />
              </Box>
            )}
          </Box>
          <Box className={ScrollClassName} paddingBottom="18">
            {Object.entries(groupedWallets).map(
              ([groupName, wallets], index) =>
                wallets.length > 0 && (
                  <Fragment key={index}>
                    {groupName ? (
                      <Box marginBottom="8" marginTop="16" marginX="6">
                        <Text
                          color="modalTextSecondary"
                          size="14"
                          weight="bold"
                        >
                          {groupName}
                        </Text>
                      </Box>
                    ) : null}
                    <Box display="flex" flexDirection="column" gap="4">
                      {wallets.map(wallet => {
                        return (
                          <ModalSelection
                            currentlySelected={wallet.id === selectedOptionId}
                            iconBackground={wallet.iconBackground}
                            iconUrl={wallet.iconUrl}
                            key={wallet.id}
                            name={wallet.name}
                            onClick={() => selectWallet(wallet)}
                            ready={wallet.ready}
                            recent={wallet.recent}
                            testId={`wallet-option-${wallet.id}`}
                          />
                        );
                      })}
                    </Box>
                  </Fragment>
                )
            )}
          </Box>
          {compactModeEnabled && (
            <>
              <Box background="generalBorder" height="1" marginTop="-1" />
              {disclaimer ? (
                <Box paddingX="24" paddingY="16" textAlign="center">
                  <Disclaimer Link={DisclaimerLink} Text={DisclaimerText} />
                </Box>
              ) : (
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="space-between"
                  paddingX="24"
                  paddingY="16"
                >
                  <Box paddingY="4">
                    <Text color="modalTextSecondary" size="14" weight="medium">
                      New to Ethereum wallets?
                    </Text>
                  </Box>
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    gap="4"
                    justifyContent="center"
                  >
                    <Box
                      className={touchableStyles({
                        active: 'shrink',
                        hover: 'grow',
                      })}
                      cursor="pointer"
                      onClick={() => changeWalletStep(WalletStep.LearnCompact, false)}
                      paddingY="4"
                      style={{ willChange: 'transform' }}
                      transition="default"
                    >
                      <Text color="accentColor" size="14" weight="bold">
                        Learn More
                      </Text>
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
      {(compactModeEnabled ? walletStep !== WalletStep.None : true) && (
        <>
          {!compactModeEnabled && (
            <Box background="generalBorder" minWidth="1" width="1" />
          )}
          <Box
            display="flex"
            flexDirection="column"
            margin="16"
            style={{ flexGrow: 1 }}
          >
            <Box
              alignItems="center"
              display="flex"
              justifyContent="space-between"
              marginBottom="12"
            >
              <Box width="28">
                {headerBackButtonLink && (
                  <Box
                    as="button"
                    className={touchableStyles({
                      active: 'shrinkSm',
                      hover: 'growLg',
                    })}
                    color="accentColor"
                    onClick={() => {
                      headerBackButtonLink &&
                        changeWalletStep(headerBackButtonLink, true);
                      headerBackButtonCallback?.();
                    }}
                    paddingX="8"
                    paddingY="4"
                    style={{
                      boxSizing: 'content-box',
                      height: 17,
                      willChange: 'transform',
                    }}
                    transition="default"
                    type="button"
                  >
                    <BackIcon />
                  </Box>
                )}
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                style={{ flexGrow: 1 }}
              >
                {headerLabel && (
                  <Text
                    color="modalText"
                    size="18"
                    textAlign="center"
                    weight="heavy"
                  >
                    {headerLabel}
                  </Text>
                )}
              </Box>
              <CloseButton onClose={onClose} />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              style={{ minHeight: compactModeEnabled ? 396 : 432 }}
            >
              <Box
                alignItems="center"
                display="flex"
                flexDirection="column"
                gap="6"
                height="full"
                justifyContent="center"
                marginX="8"
              >
                {walletContent}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
