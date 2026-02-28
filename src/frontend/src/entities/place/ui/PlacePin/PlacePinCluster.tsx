import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import './PlacePin.animations.css';

export interface PlacePinClusterProps {
  placeCount: number;
  onClick?: () => void;
  isAnimating?: boolean;
}

export const PlacePinCluster: React.FC<PlacePinClusterProps> = ({
  placeCount,
  onClick,
  isAnimating = true,
}) => {
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
          'inline-flex justify-start items-center gap-[5px]',
          { 'cursor-pointer': !!onClick },
        )}
        onClick={onClick}
      >
        <div className="w-8 p-1.5 bg-gray-500 rounded-xl flex justify-center items-center">
          <span className="text-white text-sm font-medium font-['Golos_Text']">
            {placeCount}
          </span>
        </div>
      </div>
    </div>
  );
};
