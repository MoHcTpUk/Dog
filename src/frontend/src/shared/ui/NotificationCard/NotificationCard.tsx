import React from 'react';
import { useTranslation } from 'react-i18next';
import { Notification } from '@shared/types/notification';
import { NOTIFICATION_CONFIG } from '@shared/config/notifications.config';
import { Text } from '@shared/ui/Text';
import { Icon } from '@shared/ui/Icon';

export interface NotificationCardProps {
  notification: Notification;
  onClick?: () => void;
}

const getTimeAgo = (date: Date, t: (key: string) => string): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes} ${t('min ago')}`;
  } else if (hours < 24) {
    return `${hours} ${t('h ago')}`;
  } else {
    return `${days} ${t('d ago')}`;
  }
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onClick,
}) => {
  const { t } = useTranslation();
  const config = NOTIFICATION_CONFIG[notification.type];
  const isClickable = notification.walkId !== undefined;
  const timeAgo = getTimeAgo(notification.timestamp, t);

  return (
    <div
      className={`w-full p-5 pr-10 bg-white rounded-3xl relative inline-flex flex-col justify-end items-center gap-5 overflow-visible ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="self-stretch inline-flex justify-start items-start gap-3.5">
        <div className="size-12 relative rounded-xl overflow-visible">
          <img
            src={notification.dogAvatar}
            alt={notification.dogName}
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3">
            <Icon name={config.icon} size={24} />
          </div>
        </div>
        <div className="flex-1 inline-flex flex-col justify-center items-start gap-[5px]">
          <Text variant="medium-16" color="primary" className="self-stretch">
            {notification.dogName} {t(config.textKey)}
          </Text>
          <Text variant="regular-14" color="muted" className="self-stretch h-4 leading-4">
            {timeAgo}
          </Text>
        </div>
      </div>
      {!notification.isRead && (
        <div className="absolute right-[20px] top-[20px] w-[13px] h-[13px]">
          <div className="w-[13px] h-[13px] rounded-full bg-pink-300 border-2 border-white" />
        </div>
      )}
    </div>
  );
};
