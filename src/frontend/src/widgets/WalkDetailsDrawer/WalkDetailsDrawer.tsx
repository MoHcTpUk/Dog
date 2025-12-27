import React from 'react';
import { Button, Icon, BottomDrawer } from '@shared/ui';
import { WalkInfoCard } from '@entities/walk';
import { DogInfoCard } from '@entities/dog';
import { Walk } from '@shared/types/walk';
import { useFormatWalkTime } from '@shared/hooks/useFormatWalkTime';

export interface WalkDetailsDrawerProps {
  walk: Walk | null;
  isOpen: boolean;
  onClose: () => void;
  onDogClick?: (dogId: string) => void;
  onJoinClick?: () => void;
}

export const WalkDetailsDrawer: React.FC<WalkDetailsDrawerProps> = ({
  walk,
  isOpen,
  onClose,
  onDogClick,
  onJoinClick,
}) => {
  const formattedTime = useFormatWalkTime(walk?.time || new Date());

  if (!walk) return null;

  return (
    <BottomDrawer isOpen={isOpen} onClose={onClose}>
      <>
        <div className="flex flex-col gap-5">
          <WalkInfoCard
            time={formattedTime}
            description={walk.description}
            location={walk.location}
            distance={walk.distance}
          />

          {walk.participants && walk.participants.length > 0 && (
            <div className="flex flex-col gap-1">
              {walk.participants.map((dog) => (
                <DogInfoCard
                  key={dog.id}
                  avatar={dog.avatar}
                  name={dog.name}
                  breed={dog.breed}
                  gender={dog.gender}
                  age={dog.age}
                  weight={dog.weight}
                  onClick={() => onDogClick?.(dog.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div className="p-3 -rotate-90 bg-white rounded-full flex items-center justify-center">
            <div className="rotate-90">
              <Icon name="route" size={24} color="#3F335A" />
            </div>
          </div>

          <Button
            variant="primary"
            size="M"
            icon={<Icon name="plus" size={24} color="white" />}
            onClick={onJoinClick}
          >
            Присоединиться
          </Button>
        </div>
      </>
    </BottomDrawer>
  );
};
