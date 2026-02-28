import React from 'react';
import { IonImg } from '@ionic/react';
import { Button, Icon } from '@shared/ui';
import { Text } from '@shared/ui/Text';

export interface DogRequestCardProps {
  avatar: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  onAccept?: () => void;
  onReject?: () => void;
  onProfileClick?: () => void;
  className?: string;
}

export const DogRequestCard: React.FC<DogRequestCardProps> = ({
  avatar,
  name,
  breed,
  onAccept,
  onReject,
  onProfileClick,
  className = '',
}) => {
  return (
    <div className={`p-5 bg-white rounded-3xl flex flex-col gap-5 ${className}`}>
      <div className="relative flex items-center gap-[14px]">
        <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
          <IonImg src={avatar} alt={name} className="w-full h-full object-cover" />
          <div className="absolute right-0 bottom-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-white">
            <Icon name="plus" size={12} color="white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
          <Text variant="semibold-18" color="primary">
            {name}
          </Text>
          <Text variant="regular-14" color="secondary" className="leading-4">
            {breed}
          </Text>
        </div>

        <button
          type="button"
          className="p-2 -rotate-90 bg-zinc-100 rounded-full inline-flex items-center justify-center flex-shrink-0"
          onClick={onProfileClick}
        >
          <div className="rotate-90">
            <Icon name="arrow-right" size={24} color="#3F335A" />
          </div>
        </button>
      </div>

      <div className="flex items-start gap-1">
        <div className="flex-1">
          <Button
            variant="secondary-gray"
            size="M"
            fullWidth
            onClick={onReject}
          >
            Отклонить
          </Button>
        </div>
        <div className="flex-1">
          <Button
            variant="primary"
            size="M"
            fullWidth
            onClick={onAccept}
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
};
