import React from 'react';
import { IonImg } from '@ionic/react';
import { Text, Tag, Icon } from '@shared/ui';

export interface DogInfoCardProps {
  avatar: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  age: number;
  weight: number;
  onClick?: () => void;
  className?: string;
}

export const DogInfoCard: React.FC<DogInfoCardProps> = ({
  avatar,
  name,
  breed,
  gender,
  age,
  weight,
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`p-5 bg-white rounded-3xl flex flex-col gap-5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-[15px]">
        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
          <IonImg src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 flex flex-col justify-center gap-1.5">
          <Text variant="semibold-18" color="primary">
            {name}
          </Text>
          <Text variant="regular-14" color="secondary" className="leading-[18px]">
            {breed}
          </Text>
        </div>

        {onClick && (
          <div className="w-6 h-6 flex items-center justify-center">
            <Icon name="arrow-right" size={24} color="#3F335A" />
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
    </div>
  );
};
