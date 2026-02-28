import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Icon } from '@shared/ui';
import type { IconName } from '@shared/ui/Icon/Icon';
import type { PlaceCategory } from '@shared/types/place';
import './PlacePin.animations.css';

const categoryIconMap: Record<PlaceCategory, IconName> = {
  cafe: 'cafe',
  restaurant: 'restaurant',
  shop: 'shop',
  mall: 'mall',
  park: 'park',
  other: 'pin-stroke',
};

export interface PlacePinProps {
  category?: PlaceCategory;
  onClick?: () => void;
  isAnimating?: boolean;
}

export const PlacePin: React.FC<PlacePinProps> = ({
  category,
  onClick,
  isAnimating = true,
}) => {
  const iconName = category ? categoryIconMap[category] : 'pin-stroke';
  const [shouldAnimate, setShouldAnimate] = useState(isAnimating);

  useEffect(() => {
    if (isAnimating) setShouldAnimate(true);
  }, [isAnimating]);

  return (
    <div
      className={classNames('place-pin-container', {
        'place-pin-enter': shouldAnimate,
      })}
    >
      <div
        className={classNames(
          'p-0.5 bg-white rounded-2xl',
          'shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]',
          'inline-flex justify-start items-center',
          { 'cursor-pointer': !!onClick },
        )}
        onClick={onClick}
      >
        <div className="p-1.5 bg-gray-500 rounded-xl flex justify-center items-center">
          <Icon name={iconName} size={18} color="white" />
        </div>
      </div>
    </div>
  );
};
