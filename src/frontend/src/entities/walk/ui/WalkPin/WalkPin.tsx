import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Text, Icon } from '@shared/ui';
import { useFormatWalkTime } from '@shared/hooks/useFormatWalkTime';
import { formatDogCount, getWalkNotificationConfig } from '@shared/utils';
import { WalkStatus } from '@shared/types/walk';
import './WalkPin.animations.css';

export interface WalkPinProps {
  dogAvatar: string;
  time: Date;
  dogCount: number;
  status: WalkStatus;
  onClick?: () => void;
  className?: string;
  isAnimating?: boolean;
}

export const WalkPin: React.FC<WalkPinProps> = ({
  dogAvatar,
  time,
  dogCount,
  status,
  onClick,
  className,
  isAnimating = true,
}) => {
  const formattedTime = useFormatWalkTime(time);
  const notificationConfig = getWalkNotificationConfig(status);
  const dogCountText = formatDogCount(dogCount);
  const [shouldAnimate, setShouldAnimate] = useState(isAnimating);

  useEffect(() => {
    if (isAnimating) {
      setShouldAnimate(true);
    }
  }, [isAnimating]);

  return (
    <div
      className={classNames(
        "relative inline-flex flex-col items-center walk-pin-container",
        {
          'walk-pin-enter': shouldAnimate,
        }
      )}
    >
      {/* Основной контейнер пина */}
      <div
        className={classNames(
          'relative inline-flex items-center gap-[5px]',
          'pl-0.5 pr-2.5 py-0.5',
          'bg-white rounded-2xl',
          'shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]',
          {
            'cursor-pointer hover:shadow-lg transition-shadow': onClick,
          },
          className
        )}
        onClick={onClick}
      >
        {/* Аватарка собаки */}
        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={dogAvatar}
            alt="Dog"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Текстовая информация */}
        <div className="inline-flex flex-col justify-start items-start">
          <Text
            variant="medium-14"
            color="primary"
            className="text-gray-700"
          >
            {formattedTime}
          </Text>
          <Text
            variant="medium-small-12"
            color="secondary"
            className="text-gray-500"
          >
            {dogCountText}
          </Text>
        </div>

        {/* Нотификация */}
        {notificationConfig && (
          <div
            className={classNames(
              'absolute -top-[7px] right-[-8px]',
              'w-6 h-6 rounded-full',
              'flex items-center justify-center',
              'border-3 border-[var(--color-white)]',
              '',
              notificationConfig.bgColor
            )}
          >
            <Icon
              name={notificationConfig.icon}
              size={10}
              color="white"
            />
          </div>
        )}
      </div>

      {/* Плавный закругленный язычок */}
      <svg
        width="45"
        height="20"
        viewBox="0 0 45 20"
        className="relative -mt-[1px]"
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(66, 58, 58, 0.06))' }}
      >
        <path
          d="M 0,0 Q 22.5,3 22.5,20 Q 22.5,3 45,0"
          fill="white"
        />
      </svg>
    </div>
  );
};
