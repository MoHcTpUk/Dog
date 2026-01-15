import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text, MenuItem, BottomDrawer, CenterModal, Button } from '@shared/ui';
import { useAppStore } from '@shared/store/app.store';

interface MenuItemConfig {
  labelKey: string;
  route: string;
  action?: () => void;
}

export const ProfilePage: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const { currentDog, user, logout } = useAppStore();
  const [notificationCount] = useState(2);
  const [isReferralDrawerOpen, setIsReferralDrawerOpen] = useState(false);
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);

  const handleNotificationClick = () => {
    history.push('/notifications');
  };

  const handleEditProfile = () => {
    history.push('/profile/edit');
  };

  const handleReferralClick = () => {
    setIsReferralDrawerOpen(true);
  };

  const handleShareLink = async () => {
    const shareData = {
      title: 'Dog&Co',
      text: 'Присоединяйся к Dog&Co и получи скидку!',
      url: window.location.origin + '/invite',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setIsReferralDrawerOpen(false);
        setTimeout(() => {
          setIsThankYouModalOpen(true);
        }, 300);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.log('Error sharing:', err);
      }
    }
  };

  const menuItems: MenuItemConfig[] = [
    { labelKey: 'My Promocodes', route: '/profile/promocodes' },
    { labelKey: 'Feedback', route: '/profile/feedback' },
    { labelKey: 'Notification Settings', route: '/profile/notifications' },
    { labelKey: 'Terms and Privacy', route: '/profile/terms' },
    { labelKey: 'Location Access', route: '/profile/location' },
    {
      labelKey: 'Log Out',
      route: '/welcome',
      action: () => logout()
    },
    { labelKey: 'Delete Account', route: '/profile/delete' }
  ];

  const handleMenuClick = (item: MenuItemConfig) => {
    if (item.action) {
      item.action();
    }
    history.push(item.route);
  };

  return (
    <MainLayout>
      <div className="self-stretch px-3 py-5 inline-flex flex-col justify-start items-start gap-8 w-full">
        <div className="self-stretch h-14 pl-2.5 inline-flex justify-between items-center">
          <Text variant="bold-24" color="primary" className="flex-1 leading-6">
            {t('Profile')}
          </Text>
          <div
            className="relative cursor-pointer"
            onClick={handleNotificationClick}
          >
            <div className="p-3 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] flex flex-col justify-center items-center">
              <div className="rotate-90">
                <Icon name="bell" size={24} />
              </div>
            </div>
            {notificationCount > 0 && (
              <div className="absolute min-w-5 px-1.5 py-0.5 left-[29px] top-[-9px] bg-pink-300 rounded-full flex flex-col justify-center items-center">
                <Text variant="medium-14" color="white">
                  {notificationCount}
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-center gap-10">
          <div className="self-stretch p-5 bg-white rounded-3xl flex flex-col justify-end items-center gap-5 overflow-hidden">
            <div className="self-stretch inline-flex justify-start items-center gap-3.5">
              <img
                className="size-12 rounded-xl object-cover"
                src={currentDog?.avatar || 'https://placehold.co/50x50'}
                alt={currentDog?.name || 'Dog'}
              />
              <div className="flex-1 pr-2.5 flex justify-start items-center gap-2.5 cursor-pointer" onClick={handleEditProfile}>
                <div className="flex-1 inline-flex flex-col justify-center items-start gap-[5px]">
                  <Text variant="semibold-18" color="primary">
                    {currentDog?.name || t('Name')}
                  </Text>
                  <div className="self-stretch flex flex-col justify-center items-start gap-[5px]">
                    <Text variant="regular-14" color="muted" className="leading-4">
                      {t('Owner')} {user?.firstName || ''}
                    </Text>
                  </div>
                </div>
                <div className="size-6">
                  <Icon name="edit" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div
            className="w-full p-5 relative bg-pink-300 rounded-3xl flex flex-col justify-end items-center gap-5 overflow-hidden cursor-pointer"
            onClick={handleReferralClick}
          >
            <div
              className="w-full h-[476px] left-0 top-[-50px] absolute bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400)',
                filter: 'brightness(0.7)'
              }}
            />
            <div className="self-stretch inline-flex justify-start items-start gap-2.5 relative z-10">
              <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                <Text variant="bold-24" color="white" className="self-stretch leading-6">
                  {t('10% Discount at Dog&Co')}
                </Text>
                <Text variant="medium-16" color="white" className="self-stretch">
                  {t('Invite a friend to the app')}
                </Text>
              </div>
              <div className="p-2 -rotate-90 bg-white rounded-full inline-flex flex-col justify-start items-start overflow-hidden">
                <div className="rotate-90">
                  <Icon name="arrow-right" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.route}
                title={t(item.labelKey)}
                onClick={() => handleMenuClick(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomDrawer
        isOpen={isReferralDrawerOpen}
        onClose={() => setIsReferralDrawerOpen(false)}
      >
        <div className="self-stretch flex flex-col justify-start items-center gap-5">
          <div className="self-stretch p-5 bg-white rounded-3xl flex flex-col justify-center items-start gap-5">
            <div className="self-stretch inline-flex justify-start items-start gap-[5px]">
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-[5px]">
                <Text variant="extra-bold-28" color="primary" className="self-stretch leading-6">
                  Скидка 10% в магазине Dog&Co
                </Text>
              </div>
            </div>
            <Text variant="regular-14" color="primary" className="self-stretch">
              За друга, который зарегистрируется и заполнит инфо о своей собаке, вы получите промокод на скидку
            </Text>
          </div>
        </div>
        <Button
          variant="primary"
          size="L"
          fullWidth
          onClick={handleShareLink}
        >
          Поделиться ссылкой
        </Button>
      </BottomDrawer>

      <CenterModal
        isOpen={isThankYouModalOpen}
        onClose={() => setIsThankYouModalOpen(false)}
      >
        <div className="p-5 bg-white rounded-2xl inline-flex flex-col justify-center items-start gap-10">
          <div className="w-80 flex flex-col justify-start items-start gap-2.5">
            <div className="self-stretch inline-flex justify-start items-start gap-[5px]">
              <Text variant="bold-24" color="primary" className="flex-1 leading-6">
                Спасибо, что делитесь!
              </Text>
            </div>
            <Text variant="regular-14" color="muted" className="self-stretch">
              Когда друг заполнит профиль собаки, промокод появится в разделе «Мои промокоды»
            </Text>
          </div>
          <div className="self-stretch inline-flex justify-start items-start gap-1">
            <div className="flex-1 h-12 flex justify-start items-center gap-1">
              <Button
                variant="secondary-gray"
                size="M"
                fullWidth
                onClick={() => setIsThankYouModalOpen(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      </CenterModal>
    </MainLayout>
  );
};
