import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, BottomDrawer, Tag } from '@shared/ui';
import { Text } from '@shared/ui/Text';
import { Place } from '@features/home';

export interface PlaceDetailsDrawerProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
  onRouteClick?: () => void;
  onFavoriteToggle?: () => void;
}

export const PlaceDetailsDrawer: React.FC<PlaceDetailsDrawerProps> = ({
  place,
  isOpen,
  onClose,
  onRouteClick,
  onFavoriteToggle,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  if (!place) return null;

  const hasPhotos = place.photos && place.photos.length > 0;

  const handleReportClick = () => {
    history.push(`/place/${place.id}/report`);
  };

  return (
    <BottomDrawer isOpen={isOpen} onClose={onClose}>
      <>
        <div className="flex flex-col gap-5">
          {hasPhotos && (
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-3 px-3">
              {place.photos!.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${place.name} ${index + 1}`}
                  className="w-60 h-40 rounded-2xl object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}

          <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
            <div className="flex justify-start items-start gap-5">
              <div className="flex-1 flex flex-col gap-[5px]">
                <Text variant="extra-bold-28" color="primary" className="leading-6">
                  {place.name}
                </Text>
                <Text variant="regular-14" color="muted" className="leading-4">
                  {place.categoryLabel}
                </Text>
              </div>
              <div className="cursor-pointer" onClick={onFavoriteToggle}>
                <Icon
                  name={place.isFavorite ? 'star-filled' : 'star'}
                  size={24}
                  color="var(--color-text-primary)"
                />
              </div>
            </div>

            {place.description && (
              <Text variant="regular-14" color="primary" className="leading-4">
                {place.description}
              </Text>
            )}

            <div className="flex flex-wrap gap-1">
              <Tag variant="outline" size="small">
                {place.address}
              </Tag>
              {place.workingHours && (
                <Tag variant="outline" size="small">
                  {place.workingHours}
                </Tag>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div
            className="p-3 -rotate-90 bg-white rounded-full flex items-center justify-center cursor-pointer"
            onClick={onRouteClick}
          >
            <div className="rotate-90">
              <Icon name="route" size={24} color="var(--color-text-primary)" />
            </div>
          </div>

          <Button variant="secondary-white" size="M" onClick={handleReportClick}>
            {t('Report an Error')}
          </Button>
        </div>
      </>
    </BottomDrawer>
  );
};
