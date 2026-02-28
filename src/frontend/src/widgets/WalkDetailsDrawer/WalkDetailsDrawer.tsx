import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, BottomDrawer, ConfirmModal } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import { WalkInfoCard } from '@entities/walk';
import { DogInfoCard, DogRequestCard } from '@entities/dog';
import { Walk, Dog } from '@shared/types/walk';
import { useFormatWalkTime } from '@shared/hooks/useFormatWalkTime';

export type WalkDetailsVariant = 'regular' | 'request-sent' | 'joined' | 'own' | 'own-with-requests';

export interface WalkDetailsDrawerProps {
  walk: Walk | null;
  isOpen: boolean;
  onClose: () => void;
  variant?: WalkDetailsVariant;
  onRouteClick?: () => void;
  onDogClick?: (dogId: string) => void;
  onJoinClick?: () => void;
  onLeaveClick?: () => void;
  onCancelRequestClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onAcceptRequest?: (dogId: string) => void;
  onRejectRequest?: (dogId: string) => void;
  requestedDogs?: Dog[];
}

export const WalkDetailsDrawer: React.FC<WalkDetailsDrawerProps> = ({
  walk,
  isOpen,
  onClose,
  variant = 'regular',
  onRouteClick,
  onDogClick,
  onJoinClick,
  onLeaveClick,
  onCancelRequestClick,
  onEditClick,
  onDeleteClick,
  onAcceptRequest,
  onRejectRequest,
  requestedDogs = [],
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formattedTime = useFormatWalkTime(walk?.time || new Date());

  const handleEditClick = () => {
    if (walk) {
      history.push(`/walk/${walk.id}/edit`);
    }
    onEditClick?.();
  };

  if (!walk) return null;

  const isOwnWalk = variant === 'own' || variant === 'own-with-requests';
  const showRequests = variant === 'own-with-requests' && requestedDogs.length > 0;
  const roundActionClass =
    'p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex items-center justify-center';

  return (
    <>
      <BottomDrawer isOpen={isOpen} onClose={onClose}>
        <>
          <div className="flex flex-col gap-5">
            <WalkInfoCard
              time={isOwnWalk ? `${t('New Walk')} ${formattedTime}` : formattedTime}
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

            {showRequests && (
              <div className="flex flex-col gap-5">
                <Text variant="semibold-18" color="primary">
                  Запросы на прогулку
                </Text>
                <div className="flex flex-col gap-1">
                  {requestedDogs.map((dog) => (
                    <DogRequestCard
                      key={dog.id}
                      avatar={dog.avatar}
                      name={dog.name}
                      breed={dog.breed}
                      gender={dog.gender}
                      age={dog.age}
                      weight={dog.weight}
                      onAccept={() => onAcceptRequest?.(dog.id)}
                      onReject={() => onRejectRequest?.(dog.id)}
                      onProfileClick={() => onDogClick?.(dog.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-start">
            <button
              type="button"
              className={roundActionClass}
              onClick={onRouteClick}
            >
              <div className="rotate-90">
                <Icon name="route" size={24} color="#3F335A" />
              </div>
            </button>

            <div className="flex flex-1 min-w-0 justify-end items-center gap-1 ml-3">
              {isOwnWalk && onDeleteClick && (
                <button
                  type="button"
                  className={roundActionClass}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <div className="rotate-90">
                    <Icon name="trash" size={24} color="#3F335A" />
                  </div>
                </button>
              )}

              {variant === 'regular' && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={<Icon name="plus" size={24} color="#3F335A" />}
                    onClick={onJoinClick}
                  >
                    Присоединиться
                  </Button>
                </div>
              )}

              {variant === 'request-sent' && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={<Icon name="check" size={24} color="#3F335A" />}
                    onClick={() => setShowCancelModal(true)}
                  >
                    Запрос отправлен
                  </Button>
                </div>
              )}

              {variant === 'joined' && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={<Icon name="cross" size={24} color="#3F335A" />}
                    onClick={() => setShowLeaveModal(true)}
                  >
                    Выйти из прогулки
                  </Button>
                </div>
              )}

              {isOwnWalk && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={<Icon name="edit" size={24} color="#3F335A" />}
                    onClick={handleEditClick}
                  >
                    Редактировать
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      </BottomDrawer>

      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title="Выйти из прогулки?"
        confirmText="Да, выйти"
        onConfirm={() => {
          onLeaveClick?.();
          setShowLeaveModal(false);
        }}
      />

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Отменить запрос?"
        confirmText="Да, отменить"
        onConfirm={() => {
          onCancelRequestClick?.();
          setShowCancelModal(false);
        }}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить прогулку?"
        confirmText="Да, удалить"
        onConfirm={() => {
          onDeleteClick?.();
          setShowDeleteModal(false);
        }}
      />
    </>
  );
};
