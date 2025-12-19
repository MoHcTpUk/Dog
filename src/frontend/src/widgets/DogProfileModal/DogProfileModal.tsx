import React, { useState } from 'react';
import { IonPage, IonContent, IonImg } from '@ionic/react';
import { Text, Icon, Tag, Button } from '@shared/ui';
import { Dog } from '@shared/types/walk';

export interface DogProfileModalProps {
  dog: Dog | null;
  onClose?: () => void;
  onInviteClick?: () => void;
}

export const DogProfileModal: React.FC<DogProfileModalProps> = ({
  dog,
  onClose,
  onInviteClick,
}) => {
  const [currentImageIndex] = useState(0);

  if (!dog) {
    return null;
  }

  const images = [dog.avatar, dog.avatar, dog.avatar, dog.avatar];

  const healthTags = [];
  if (dog.isSterilized) healthTags.push('Стерилизована');
  if (dog.isVaccinated) healthTags.push('Вакцинирована');
  if (dog.isTreatedForParasites) healthTags.push('Обработана от паразитов');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-zinc-100">
        <div className="flex flex-col gap-5 px-3 pt-2.5 pb-5">

          <div className="flex justify-between items-center h-[55px]">
            <div className="w-6 h-6 flex items-center justify-center cursor-pointer" onClick={handleClose}>
              <Icon name="arrow-left" size={24} color="#3F335A" />
            </div>
            <div className="relative flex flex-col">
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon name="bell" size={24} color="#3F335A" />
              </div>
              <div className="absolute -top-2 -right-2 min-w-[21px] px-1.5 py-0.5 bg-pink-300 rounded-full flex items-center justify-center">
                <Text variant="medium-small-12" color="white">
                  2
                </Text>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-[15px]">
              <div className="w-[334px] h-[334px] rounded-3xl overflow-hidden">
                <IonImg
                  src={images[currentImageIndex]}
                  alt={dog.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-full ${
                      index === currentImageIndex
                        ? 'w-[7px] h-[7px] bg-primary'
                        : 'w-[5px] h-[5px] bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full flex flex-col gap-1">
              <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Text variant="bold-24" color="primary" className="leading-6">
                    {dog.name}
                  </Text>
                  <Text variant="regular-14" color="secondary" className="leading-[18px]">
                    {dog.breed}
                  </Text>
                </div>

                <div className="flex items-start gap-1 flex-wrap">
                  <Tag variant="outline" size="small">
                    {dog.gender === 'female' ? 'Девочка' : 'Мальчик'}
                  </Tag>
                  <Tag variant="outline" size="small">
                    {dog.age} {dog.age === 1 ? 'год' : dog.age < 5 ? 'года' : 'лет'}
                  </Tag>
                  <Tag variant="outline" size="small">
                    {dog.weight} кг
                  </Tag>
                </div>
              </div>

              {healthTags.length > 0 && (
                <div className="p-5 bg-white rounded-3xl">
                  <div className="flex items-start gap-1 flex-wrap">
                    {healthTags.map((tag, index) => (
                      <Tag
                        key={index}
                        variant="default"
                        size="small"
                        icon={<Icon name="check" size={16} color="#3F335A" />}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {dog.description && (
                <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
                  <Text variant="regular-14" color="primary" className="leading-[18px]">
                    {dog.description}
                  </Text>

                  {(dog.activityLevel || (dog.compatibility && dog.compatibility.length > 0)) && (
                    <div className="flex items-start gap-1 flex-wrap">
                      {dog.activityLevel && (
                        <Tag variant="outline" size="small">
                          {dog.activityLevel}
                        </Tag>
                      )}
                      {dog.compatibility?.map((item, index) => (
                        <Tag key={index} variant="outline" size="small">
                          {item}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-start gap-1.5">
                      <Text variant="semibold-18" color="primary">
                        {dog.owner.name}
                      </Text>
                      <Text variant="semibold-18" color="primary">
                        ·
                      </Text>
                      <Text variant="semibold-18" color="primary">
                        {dog.owner.age} лет
                      </Text>
                    </div>
                    <Text variant="regular-14" color="secondary" className="leading-[18px]">
                      Хозяин
                    </Text>
                  </div>

                  <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
                    <IonImg
                      src={dog.owner.avatar}
                      alt={dog.owner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button variant="primary" size="L" fullWidth onClick={onInviteClick}>
            Позвать на прогулку
          </Button>
        </div>
      </IonContent>
    </IonPage>
  );
};
