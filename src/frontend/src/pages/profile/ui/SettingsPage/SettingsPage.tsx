import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text, Switch } from '@shared/ui';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export const SettingsPage: React.FC = () => {
  const history = useHistory();
  const [notificationCount] = useState(2);
  const [allNotificationsEnabled, setAllNotificationsEnabled] = useState(true);

  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'walk-invites', label: 'Приглашения на прогулки', enabled: true },
    { id: 'walks-nearby', label: 'Прогулки рядом', enabled: true },
    { id: 'walk-reminders', label: 'Напоминания о прогулках', enabled: true },
    { id: 'team-updates', label: 'Обновления от команды', enabled: false },
    { id: 'new-places', label: 'Новое дог-френдли место', enabled: true },
  ]);

  const handleNotificationClick = () => {
    history.push('/notifications');
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleToggle = (id: string) => {
    if (!allNotificationsEnabled) return;
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleToggleAll = (enabled: boolean) => {
    setAllNotificationsEnabled(enabled);
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
            Настройки
          </Text>
          <div
            className="relative cursor-pointer"
            onClick={handleNotificationClick}
          >
            <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center gap-2.5 overflow-hidden">
              <div className="rotate-90">
                <Icon name="bell" size={24} />
              </div>
            </div>
            {notificationCount > 0 && (
              <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center gap-2.5">
                <Text variant="medium-14" color="white">
                  {notificationCount}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-10">
          <div className="self-stretch p-5 bg-white rounded-3xl flex flex-col justify-start items-start gap-3">
            <div className="self-stretch inline-flex justify-start items-center gap-3.5">
              <Text variant="semibold-18" color="primary" className="flex-1">
                Все уведомления
              </Text>
              <Switch
                checked={allNotificationsEnabled}
                onChange={handleToggleAll}
              />
            </div>
            <Text variant="regular-14" color="muted" className="leading-4">
              {allNotificationsEnabled
                ? 'Вы получаете все уведомления'
                : 'Уведомления отключены'}
            </Text>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="w-full h-14 px-5 py-3.5 bg-white rounded-2xl flex flex-col justify-center items-center gap-5 overflow-hidden"
              >
                <div className="self-stretch inline-flex justify-start items-center gap-3.5">
                  <Text
                    variant="medium-16"
                    color={allNotificationsEnabled ? 'primary' : 'muted'}
                    className="flex-1"
                  >
                    {setting.label}
                  </Text>
                  <Switch
                    checked={allNotificationsEnabled && setting.enabled}
                    onChange={() => handleToggle(setting.id)}
                    disabled={!allNotificationsEnabled}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
