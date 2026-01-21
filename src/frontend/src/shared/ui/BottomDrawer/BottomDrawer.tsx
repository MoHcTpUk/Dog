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
      <div className="w-full h-full max-h-[85vh] flex flex-col bg-zinc-100 rounded-t-[20px]">
        <div className="w-12 h-1 bg-zinc-300 rounded-full mx-auto mt-2 mb-2 shrink-0" />
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <div className="flex flex-col gap-10">
            {children}
          </div>
        </div>
      </div>
    </IonModal>
  );
};