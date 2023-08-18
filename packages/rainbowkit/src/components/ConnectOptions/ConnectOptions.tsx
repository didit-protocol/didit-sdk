import React from 'react';
import { isMobile } from '../../utils/isMobile';
import { DesktopOptions } from './DesktopOptions';
import { MobileOptions } from './MobileOptions';

export default function ConnectOptions({ onClose, setStep, step}: { onClose: () => void, setStep: (step: string) => void, step: string}) {
  return isMobile() ? (
    <MobileOptions onClose={onClose} />
  ) : (
    <DesktopOptions onClose={onClose} setStep={setStep} step={step}/>
  );
}
