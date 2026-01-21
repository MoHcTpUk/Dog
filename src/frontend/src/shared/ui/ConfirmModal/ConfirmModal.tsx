import React from 'react';
import { CenterModal } from '../CenterModal';
import { Button } from '../Button';
import { Text } from '../Text';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  confirmText,
  cancelText = 'Отмена',
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <CenterModal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-start gap-[5px]">
            <Text variant="bold-24" color="primary" className="flex-1 leading-6">
              {title}
            </Text>
          </div>
        </div>

        <div className="flex items-start gap-1">
          <Button
            variant="secondary-gray"
            size="M"
            fullWidth
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
          <Button
            variant="primary"
            size="M"
            fullWidth
            onClick={onClose}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </CenterModal>
  );
};
