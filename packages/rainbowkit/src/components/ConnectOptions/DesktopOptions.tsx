import React, { useContext, useEffect, useState } from 'react';
import { isSafari } from '../../utils/browsers';
import { groupBy } from '../../utils/groupBy';
import {
  useWalletConnectors,
  WalletConnector,
} from '../../wallets/useWalletConnectors';
import { ConnectModalIntro } from '../ConnectModal/ConnectModalIntro';
import { AppContext } from '../RainbowKitProvider/AppContext';
import {
  ModalSizeContext,
  ModalSizeOptions,
} from '../RainbowKitProvider/ModalSizeContext';
import WelcomeScreen from "./screens/WelcomeScreen";
import EmailRegistrationComponent from "./screens/EmailRegistration";
import {
  ConnectDetail,
  DownloadDetail,
  DownloadOptionsDetail,
  GetDetail,
  InstructionExtensionDetail,
  InstructionMobileDetail,
} from './ConnectDetails';
import './App.css';
import PermissionListComponent from './screens/Permissions';
import SuccessComponent from './screens/SuccessComponent';
import SocialLoginComponent from './screens/SocialLogin';
import { WalletConnectComponent } from './screens/WalletConnect';
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

export function DesktopOptions({ onClose, setStep, step}: 
  { onClose: () => void, 
    setStep: (step: string) => void,
    step: string,
  }) {

  const permissionsData = [
    { id: 1, text: 'Email', authorized: false },
    { id: 2, text: 'Profile Information', authorized: false },
    { id: 3, text: 'Contacts', authorized: false },
    // Add more items as needed
  ];

  const [permissions, setPermissions] = React.useState(permissionsData);
  
  const handleAccountCreation = () => {
    setStep('showAccountSuccess');
  };
  
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


  const safari = isSafari();
  const [selectedOptionId, setSelectedOptionId] = useState<
    string | undefined
  >();
  const [selectedWallet, setSelectedWallet] = useState<WalletConnector>();
  const [qrCodeUri, setQrCodeUri] = useState<string>();
  const hasQrCode = !!selectedWallet?.qrCode && qrCodeUri;
  const [connectionError, setConnectionError] = useState(false);
  const modalSize = useContext(ModalSizeContext);
  const compactModeEnabled = modalSize === ModalSizeOptions.COMPACT;
  const { disclaimer: Disclaimer } = useContext(AppContext);

  const wallets = useWalletConnectors()
    .filter(wallet => wallet.ready || !!wallet.extensionDownloadUrl)
    .sort((a, b) => a.groupIndex - b.groupIndex);

  const groupedWallets = groupBy(wallets, wallet => wallet.groupName);

  const connectToWallet = (wallet: WalletConnector) => {
    setConnectionError(false);
    if (wallet.ready) {
      wallet?.connect?.()?.catch(() => {
        setConnectionError(true);
      });

      const getDesktopDeepLink = wallet.desktop?.getUri;
      if (getDesktopDeepLink) {
        // if desktop deep link, wait for uri
        setTimeout(async () => {
          const uri = await getDesktopDeepLink();
          window.open(uri, safari ? '_blank' : '_self');
        }, 0);
      }
    }
  };

  const selectWallet = (wallet: WalletConnector) => {
    connectToWallet(wallet);
    setSelectedOptionId(wallet.id);

    if (wallet.ready) {
      // We need to guard against "onConnecting" callbacks being fired
      // multiple times since connector instances can be shared between
      // wallets. Ideally wagmi would let us scope the callback to the
      // specific "connect" call, but this will work in the meantime.
      let callbackFired = false;

      wallet?.onConnecting?.(async () => {
        if (callbackFired) return;
        callbackFired = true;

        const sWallet = wallets.find(w => wallet.id === w.id);
        const uri = await sWallet?.qrCode?.getUri();
        setQrCodeUri(uri);

        // This timeout prevents the UI from flickering if connection is instant,
        // otherwise users will see a flash of the "connecting" state.
        setTimeout(
          () => {
            setSelectedWallet(sWallet);
            changeWalletStep(WalletStep.Connect);
          },
          uri ? 0 : 50
        );

        // If the WalletConnect request is rejected, restart the wallet
        // selection flow to create a new connection with a new QR code
        const provider = await sWallet?.connector.getProvider();
        const connection = provider?.signer?.connection;
        if (connection?.on && connection?.off) {
          const handleConnectionClose = () => {
            removeHandlers();
            selectWallet(wallet);
          };
          const removeHandlers = () => {
            connection.off('close', handleConnectionClose);
            connection.off('open', removeHandlers);
          };
          connection.on('close', handleConnectionClose);
          connection.on('open', removeHandlers);
        }
      });
    } else {
      setSelectedWallet(wallet);
      changeWalletStep(
        wallet?.extensionDownloadUrl
          ? WalletStep.DownloadOptions
          : WalletStep.Connect
      );
    }
  };

  const getWalletDownload = (id: string) => {
    setSelectedOptionId(id);
    const sWallet = wallets.find(w => id === w.id);
    const isMobile = sWallet?.downloadUrls?.qrCode;
    const isExtension = !!sWallet?.extensionDownloadUrl;
    setSelectedWallet(sWallet);
    if (isMobile && isExtension) {
      changeWalletStep(WalletStep.DownloadOptions);
    } else if (isMobile) {
      changeWalletStep(WalletStep.Download);
    } else {
      changeWalletStep(WalletStep.InstructionsExtension);
    }
  };

  const clearSelectedWallet = () => {
    setSelectedOptionId(undefined);
    setSelectedWallet(undefined);
    setQrCodeUri(undefined);
  };
  const changeWalletStep = (
    newWalletStep: WalletStep,
    isBack: boolean = false
  ) => {
    if (
      isBack &&
      newWalletStep === WalletStep.Get &&
      initialWalletStep === WalletStep.Get
    ) {
      clearSelectedWallet();
    } else if (!isBack && newWalletStep === WalletStep.Get) {
      setInitialWalletStep(WalletStep.Get);
    } else if (!isBack && newWalletStep === WalletStep.Connect) {
      setInitialWalletStep(WalletStep.Connect);
    }
    setWalletStep(newWalletStep);
  };
  const [initialWalletStep, setInitialWalletStep] = useState<WalletStep>(
    WalletStep.None
  );
  const [walletStep, setWalletStep] = useState<WalletStep>(WalletStep.None);

  let walletContent = null;
  let headerLabel = null;
  let headerBackButtonLink: WalletStep | null = null;
  let headerBackButtonCallback: () => void;

  useEffect(() => {
    setConnectionError(false);
  }, [walletStep, selectedWallet]);

  const hasExtension = !!selectedWallet?.extensionDownloadUrl;
  const hasExtensionAndMobile = !!(
    hasExtension && selectedWallet?.mobileDownloadUrl
  );

  switch (walletStep) {
    case WalletStep.None:
      walletContent = (
        <ConnectModalIntro getWallet={() => changeWalletStep(WalletStep.Get)} />
      );
      break;
    case WalletStep.LearnCompact:
      walletContent = (
        <ConnectModalIntro
          compactModeEnabled={compactModeEnabled}
          getWallet={() => changeWalletStep(WalletStep.Get)}
        />
      );
      headerLabel = 'What is a Wallet?';
      headerBackButtonLink = WalletStep.None;
      break;
    case WalletStep.Get:
      walletContent = <GetDetail getWalletDownload={getWalletDownload} />;
      headerLabel = 'Get a Wallet';
      headerBackButtonLink = compactModeEnabled
        ? WalletStep.LearnCompact
        : WalletStep.None;
      break;
    case WalletStep.Connect:
      walletContent = selectedWallet && (
        <ConnectDetail
          changeWalletStep={changeWalletStep}
          compactModeEnabled={compactModeEnabled}
          connectionError={connectionError}
          onClose={onClose}
          qrCodeUri={qrCodeUri}
          reconnect={connectToWallet}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        hasQrCode &&
        `Scan with ${
          selectedWallet.name === 'WalletConnect'
            ? 'your phone'
            : selectedWallet.name
        }`;
      headerBackButtonLink = compactModeEnabled ? WalletStep.None : null;
      headerBackButtonCallback = compactModeEnabled
        ? clearSelectedWallet
        : () => {};
      break;
    case WalletStep.DownloadOptions:
      walletContent = selectedWallet && (
        <DownloadOptionsDetail
          changeWalletStep={changeWalletStep}
          wallet={selectedWallet}
        />
      );
      headerLabel = selectedWallet && `Get ${selectedWallet.name}`;
      headerBackButtonLink =
        hasExtensionAndMobile && WalletStep.Connect ? initialWalletStep : null;
      break;
    case WalletStep.Download:
      walletContent = selectedWallet && (
        <DownloadDetail
          changeWalletStep={changeWalletStep}
          wallet={selectedWallet}
        />
      );
      headerLabel = selectedWallet && `Install ${selectedWallet.name}`;
      headerBackButtonLink = hasExtensionAndMobile
        ? WalletStep.DownloadOptions
        : initialWalletStep;
      break;
    case WalletStep.InstructionsMobile:
      walletContent = selectedWallet && (
        <InstructionMobileDetail
          connectWallet={selectWallet}
          wallet={selectedWallet}
        />
      );
      headerLabel =
        selectedWallet &&
        `Get started with ${
          compactModeEnabled
            ? selectedWallet.shortName || selectedWallet.name
            : selectedWallet.name
        }`;
      headerBackButtonLink = WalletStep.Download;
      break;
    case WalletStep.InstructionsExtension:
      walletContent = selectedWallet && (
        <InstructionExtensionDetail wallet={selectedWallet} />
      );
      headerLabel =
        selectedWallet &&
        `Get started with ${
          compactModeEnabled
            ? selectedWallet.shortName || selectedWallet.name
            : selectedWallet.name
        }`;
      headerBackButtonLink = WalletStep.DownloadOptions;
      break;
    default:
      break;
  }

  const walletComponentProps = {
    compactModeEnabled,
    walletStep,
    WalletStep,
    disclaimer: Disclaimer, // Replace with the actual disclaimer
    onClose,
    changeWalletStep,
    selectedOptionId,
    selectWallet,
    groupedWallets,
    headerBackButtonLink,
    headerBackButtonCallback,
    headerLabel,
    walletContent,
  };

  return (
    <>
    <div className="popup">
      {step === "showSocialLogin" ? (
          <SocialLoginComponent onClose={onClose} />
        )   
          : step === "showEmailRegistration" ? (
            <EmailRegistrationComponent
              handleAccountCreation={handleAccountCreation}
            />
        )
          : 
          (
            step === "showWelcomeScreen" && <WelcomeScreen 
              setStep={setStep}
            />
    )
  }
  </div>
  {step === "showWalletLogin" && <WalletConnectComponent {...walletComponentProps} />}
  </>
  );
}
