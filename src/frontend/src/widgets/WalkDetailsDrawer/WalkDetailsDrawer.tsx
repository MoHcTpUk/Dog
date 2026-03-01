import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, BottomDrawer, ConfirmModal, RoundIconButton } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import { WalkInfoCard } from '@entities/walk';
import { DogInfoCard, DogRequestCard } from '@entities/dog';
import { Walk, Dog } from '@shared/types/walk';
import { useFormatWalkTime } from '@shared/hooks/useFormatWalkTime';
import {
  isOwnWalkVariant,
  WALK_DETAILS_ACTIONS,
  WALK_DETAILS_MODAL_CONTENT,
  type WalkDetailsModalKey,
  type WalkDetailsVariant,
} from './lib/walkDetailsDrawer.config';

export type { WalkDetailsVariant } from './lib/walkDetailsDrawer.config';

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
  const [activeModal, setActiveModal] = useState<WalkDetailsModalKey | null>(null);

  const formattedTime = useFormatWalkTime(walk?.time || new Date());

  const handleEditClick = () => {
    if (walk) {
      history.push(`/walk/${walk.id}/edit`);
    }
    onEditClick?.();
  };

  if (!walk) return null;

  const isOwnWalk = isOwnWalkVariant(variant);
  const showRequests = variant === 'own-with-requests' && requestedDogs.length > 0;
  const actionConfig =
    variant === 'regular' || variant === 'request-sent' || variant === 'joined'
      ? WALK_DETAILS_ACTIONS[variant]
      : null;
  const handleActionClick =
    variant === 'regular'
      ? onJoinClick
      : variant === 'request-sent'
        ? () => setActiveModal('cancel')
        : variant === 'joined'
          ? () => setActiveModal('leave')
          : undefined;
  const modalContent = activeModal ? WALK_DETAILS_MODAL_CONTENT[activeModal] : null;

  const handleModalConfirm = () => {
    if (activeModal === 'leave') {
      onLeaveClick?.();
    } else if (activeModal === 'cancel') {
      onCancelRequestClick?.();
    } else if (activeModal === 'delete') {
      onDeleteClick?.();
    }

    setActiveModal(null);
  };

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
                  {t('Walk requests')}
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
            <RoundIconButton onClick={onRouteClick} rotateContent className="p-3">
              <Icon name="route" size={24} color="#3F335A" />
            </RoundIconButton>

            <div className="flex flex-1 min-w-0 justify-end items-center gap-1 ml-3">
              {isOwnWalk && onDeleteClick && (
                <RoundIconButton
                  onClick={() => setActiveModal('delete')}
                  rotateContent
                  className="p-3"
                >
                  <Icon name="trash" size={24} color="#3F335A" />
                </RoundIconButton>
              )}

              {actionConfig && handleActionClick && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={<Icon name={actionConfig.iconName} size={24} color="#3F335A" />}
                    onClick={handleActionClick}
                  >
                    {t(actionConfig.labelKey)}
                  </Button>
                </div>
              )}

              {isOwnWalk && (
                <div className="min-w-0">
                  <Button
                    variant="secondary-white"
                    size="M"
                    shadow
                    icon={
                      <Icon
                        name={WALK_DETAILS_ACTIONS.edit.iconName}
                        size={24}
                        color="#3F335A"
                      />
                    }
                    onClick={handleEditClick}
                  >
                    {t(WALK_DETAILS_ACTIONS.edit.labelKey)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      </BottomDrawer>

      {modalContent && (
        <ConfirmModal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          title={t(modalContent.titleKey)}
          confirmText={t(modalContent.confirmTextKey)}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
};
