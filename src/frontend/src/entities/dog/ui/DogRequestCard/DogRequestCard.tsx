import React from 'react';
import { IonImg } from '@ionic/react';
import { Text, Tag, Icon, Button } from '@shared/ui';

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
  gender,
  age,
  weight,
  onAccept,
  onReject,
  onProfileClick,
  className = '',
}) => {
  return (
    <div
      className={`p-5 bg-white rounded-3xl flex flex-col gap-5 ${className}`}
    >
      <div className="flex items-center gap-[15px] relative">
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 relative">
          <IonImg src={avatar} alt={name} className="w-full h-full object-cover" />
          <div className="absolute w-6 h-6 left-[44px] top-[44px] flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Icon name="notification-plus" size={24} color="#3F335A" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <Text variant="semibold-18" color="primary">
            {name}
          </Text>
          <Text variant="regular-14" color="secondary" className="leading-[18px]">
            {breed}
          </Text>
        </div>

        {onProfileClick && (
          <div
            className="w-8 h-8 p-2 -rotate-90 bg-zinc-100 rounded-full flex items-center justify-center cursor-pointer"
            onClick={onProfileClick}
          >
            <div className="rotate-90">
              <Icon name="arrow-right" size={24} color="#3F335A" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-1 flex-wrap">
        <Tag variant="outline" size="small">
          {gender === 'female' ? 'Девочка' : 'Мальчик'}
        </Tag>
        <Tag variant="outline" size="small">
          {age} {age === 1 ? 'год' : age < 5 ? 'года' : 'лет'}
        </Tag>
        <Tag variant="outline" size="small">
          {weight} кг
        </Tag>
      </div>

      {(onAccept || onReject) && (
        <div className="flex items-start gap-1">
          <Button
            variant="secondary-gray"
            size="M"
            fullWidth
            onClick={onReject}
          >
            Отклонить
          </Button>
          <Button
            variant="primary"
            size="M"
            fullWidth
            onClick={onAccept}
          >
            Принять
          </Button>
        </div>
      )}
    </div>
  );
};
