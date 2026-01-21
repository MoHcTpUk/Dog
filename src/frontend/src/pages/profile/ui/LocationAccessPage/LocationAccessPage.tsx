import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text, Button, BottomDrawer } from '@shared/ui';

type PermissionStatus = 'prompt' | 'granted' | 'denied';

export const LocationAccessPage: React.FC = () => {
  const history = useHistory();
  const [notificationCount] = useState(2);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [isExplanationDrawerOpen, setIsExplanationDrawerOpen] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      if ('permissions' in navigator && 'geolocation' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state as PermissionStatus);

        result.addEventListener('change', () => {
          setPermissionStatus(result.state as PermissionStatus);
        });
      }
    } catch {
      console.log('Permission API not supported');
    }
  };

  const handleNotificationClick = () => {
    history.push('/notifications');
  };

  const handleBack = () => {
    history.goBack();
  };

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setPermissionStatus('granted');
      console.log('Location permission granted', position);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && 'PERMISSION_DENIED' in error && error.code === error.PERMISSION_DENIED) {
        setPermissionStatus('denied');
      }
      console.log('Location permission denied', error);
    }
  };

  const handlePermissionAction = () => {
    if (permissionStatus === 'prompt') {
      setIsExplanationDrawerOpen(true);
    } else if (permissionStatus === 'denied') {
      // На iOS/Android направляет в системные настройки
      alert('Откройте настройки устройства → Dog&Co → Разрешения → Включите Геолокацию');
    } else {
      // Уже разрешено, показываем как отключить
      alert('Чтобы отключить доступ, перейдите в настройки устройства → Dog&Co → Разрешения');
    }
  };

  const handleConfirmExplanation = async () => {
    setIsExplanationDrawerOpen(false);
    await requestLocationPermission();
  };

  const getStatusInfo = () => {
    switch (permissionStatus) {
      case 'granted':
        return {
          status: 'Разрешено',
          description: 'Приложение может использовать вашу геолокацию',
          buttonText: 'Управление доступом',
          iconColor: 'text-green-500',
        };
      case 'denied':
        return {
          status: 'Запрещено',
          description: 'Откройте настройки устройства, чтобы разрешить доступ',
          buttonText: 'Открыть настройки',
          iconColor: 'text-red-500',
        };
      default:
        return {
          status: 'Не запрошено',
          description: 'Разрешите доступ, чтобы находить прогулки и места рядом',
          buttonText: 'Разрешить доступ',
          iconColor: 'text-gray-400',
        };
    }
  };

  const statusInfo = getStatusInfo();

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
            Геолокация
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

        <div className="self-stretch flex flex-col justify-start items-start gap-5">
          <div className="self-stretch p-5 bg-white rounded-3xl flex flex-col justify-start items-start gap-5">
            <div className="self-stretch flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${permissionStatus === 'granted' ? 'bg-green-500' : permissionStatus === 'denied' ? 'bg-red-500' : 'bg-gray-400'}`} />
                <Text variant="semibold-18" color="primary">
                  {statusInfo.status}
                </Text>
              </div>
              <Text variant="regular-14" color="muted">
                {statusInfo.description}
              </Text>
            </div>
          </div>

          <div className="self-stretch p-5 bg-white rounded-3xl flex flex-col justify-start items-start gap-5">
            <Text variant="semibold-18" color="primary">
              Зачем нужна геолокация?
            </Text>
            <div className="self-stretch flex flex-col gap-3">
              <div className="flex gap-3">
                <Text variant="regular-14" color="muted">
                  • Показывать прогулки и собак рядом с вами
                </Text>
              </div>
              <div className="flex gap-3">
                <Text variant="regular-14" color="muted">
                  • Находить дог-френдли места поблизости
                </Text>
              </div>
              <div className="flex gap-3">
                <Text variant="regular-14" color="muted">
                  • Отображать ваше местоположение на карте
                </Text>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="L"
            fullWidth
            onClick={handlePermissionAction}
          >
            {statusInfo.buttonText}
          </Button>
        </div>
      </div>

      <BottomDrawer
        isOpen={isExplanationDrawerOpen}
        onClose={() => setIsExplanationDrawerOpen(false)}
      >
        <div className="self-stretch flex flex-col justify-start items-center gap-5">
          <div className="size-16 p-5 bg-white rounded-full flex flex-col justify-center items-center gap-5 overflow-hidden">
            <div className="relative">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 13.6852C6 0.104874 26 0.104974 26 13.6852C26 18.1472 23.3342 21.951 20.7555 24.5868C18.9874 26.3939 18.1034 27.2975 16.0003 27.2975C13.8972 27.2975 13.0131 26.394 11.245 24.5869C8.66603 21.9512 6 18.1473 6 13.6852Z" stroke="var(--Cool-dark, #3F335A)" strokeWidth="1.5"/>
                <circle cx="16" cy="13.5" r="3.75" stroke="var(--Cool-dark, #3F335A)" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <Text variant="semibold-18" color="primary" className="text-center">
              Геолокация отключена
            </Text>
            <Text variant="regular-16" color="muted" className="text-center leading-5">
              Разрешите доступ к геолокации, чтобы видеть, где рядом гуляют другие собаки
            </Text>
          </div>
        </div>
        <Button
          variant="primary"
          size="L"
          fullWidth
          onClick={handleConfirmExplanation}
        >
          Включить геолокацию
        </Button>
      </BottomDrawer>
    </MainLayout>
  );
};
