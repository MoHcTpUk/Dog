import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text, NotificationCard } from '@shared/ui';
import { Notification } from '@shared/types/notification';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'join-request',
    dogName: 'Сара',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'walk-invite',
    dogName: 'Макс',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '2',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'invite-accepted',
    dogName: 'Белла',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '3',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '4',
    type: 'invite-rejected',
    dogName: 'Рекс',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '4',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '5',
    type: 'request-accepted',
    dogName: 'Луна',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '5',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    type: 'request-rejected',
    dogName: 'Чарли',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '6',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '7',
    type: 'walk-deleted',
    dogName: 'Тоби',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: undefined,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '8',
    type: 'walk-updated',
    dogName: 'Джек',
    dogAvatar: 'https://placehold.co/48x48',
    walkId: '7',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
];

export const NotificationsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();
  const [notifications] = useState<Notification[]>(mockNotifications);

  const handleBack = () => {
    history.goBack();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.walkId) {
      // Передаём background без query параметров
      const cleanLocation = {
        ...location,
        search: '',
      };
      history.push(`/walk/${notification.walkId}`, { background: cleanLocation });
    }
  };

  return (
    <MainLayout>
      <div className="self-stretch px-3 py-5 inline-flex flex-col justify-start items-start gap-8 w-full">
        <div className="self-stretch h-14 inline-flex justify-start items-center gap-3.5">
          <div
            className="p-2 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={handleBack}
          >
            <div className="size-6 relative rotate-90 overflow-hidden">
              <Icon name="arrow-left" size={24} />
            </div>
          </div>
          <Text variant="bold-24" color="primary" className="flex-1 leading-6">
            {t('Notifications')}
          </Text>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-[8px]">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
