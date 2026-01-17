import React from 'react';
import { IonModal } from '@ionic/react';

export interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={undefined}
      breakpoints={undefined}
      backdropDismiss={true}
      handle={false}
    >
      <div className="w-full px-3 pt-4 pb-8 bg-zinc-100 rounded-t-[20px] flex flex-col gap-10">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto -mt-2 mb-[-16px]" />
        {children}
      </div>
    </IonModal>
  );
};