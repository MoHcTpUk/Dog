import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Text } from '../Text';
import './WalkPin.animations.css';

export interface WalkPinClusterProps {
  dogAvatars: string[];
  walkCount: number;
  onClick?: () => void;
  className?: string;
  isAnimating?: boolean;
}

export const WalkPinCluster: React.FC<WalkPinClusterProps> = ({
  dogAvatars,
  walkCount,
  onClick,
  className,
  isAnimating = true,
}) => {
  // Показываем максимум 3 аватарки
  const displayAvatars = dogAvatars.slice(0, 3);
  const [shouldAnimate, setShouldAnimate] = useState(isAnimating);

  useEffect(() => {
    if (isAnimating) {
      setShouldAnimate(true);
    }
  }, [isAnimating]);

  return (
    <div
      className={classNames(
        "relative inline-flex flex-col items-center cluster-container",
        {
          'cluster-enter': shouldAnimate,
        }
      )}
    >
      {/* Основной контейнер кластера */}
      <div
        className={classNames(
          'inline-flex items-center gap-[5px]',
          'pr-2.5',
          'bg-white rounded-full',
          'shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]',
          {
            'cursor-pointer hover:shadow-lg transition-shadow': onClick,
          },
          className
        )}
        onClick={onClick}
      >
        {/* Аватарки собак */}
        <div className="inline-flex items-center">
          {displayAvatars.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`Dog ${index + 1}`}
              className={classNames(
                'w-8 h-8 rounded-full border-2 border-white object-cover',
                {
                  '-ml-2': index > 0,
                }
              )}
              style={{
                zIndex: displayAvatars.length - index,
              }}
            />
          ))}
        </div>

        {/* Количество прогулок */}
        <Text
          variant="medium-14"
          color="primary"
          className="text-gray-700"
        >
          {walkCount}
        </Text>
      </div>
    </div>
  );
};
