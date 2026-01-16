import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MainLayout } from '@app/layouts/MainLayout';
import { Icon, Text, PromoCodeCard } from '@shared/ui';

interface PromoCode {
  id: string;
  title: string;
  discount: string;
  validUntil: string;
  description: string;
  code: string;
}

export const PromocodesPage: React.FC = () => {
  const history = useHistory();
  const [notificationCount] = useState(2);

  const handleNotificationClick = () => {
    history.push('/notifications');
  };

  const handleBack = () => {
    history.goBack();
  };

  const promoCodes: PromoCode[] = [
    {
      id: '1',
      title: 'Dog&CO',
      discount: '10%',
      validUntil: '13.06.25',
      description: 'За приглашённого друга вы получили скидку 10% в Dog&Co. В Dog&Co вы найдёте игрушки и стильные аксессуары для собак',
      code: 'Dog&COpromo134',
    },
    {
      id: '2',
      title: '4 лапы',
      discount: '5%',
      validUntil: '13.06.25',
      description: 'Ваш подарок за регистрацию – 5% скидка на первый заказ в магазин 4 лапы',
      code: '4lapyandAppa',
    },
  ];

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
            Мои промокоды
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

        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          {promoCodes.map((promo) => (
            <PromoCodeCard
              key={promo.id}
              title={promo.title}
              discount={promo.discount}
              validUntil={promo.validUntil}
              description={promo.description}
              code={promo.code}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
