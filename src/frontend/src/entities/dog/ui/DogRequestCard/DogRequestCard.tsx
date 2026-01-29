import React from 'react';
import { Button } from '@shared/ui';
import { DogInfoCard, DogInfoCardProps } from '../DogInfoCard';

export interface DogRequestCardProps extends Omit<DogInfoCardProps, 'onClick'> {
  onAccept?: () => void;
  onReject?: () => void;
  onProfileClick?: () => void;
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
    <div className="flex flex-col gap-5">
      <DogInfoCard
        avatar={avatar}
        name={name}
        breed={breed}
        gender={gender}
        age={age}
        weight={weight}
        onClick={onProfileClick}
        className={className}
      />

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
