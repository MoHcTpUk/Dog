import React, { useState, useRef, useEffect } from 'react';
import { IonPage, IonContent, IonImg } from '@ionic/react';
import { Text, Icon, Tag, Button } from '@shared/ui';
import { Dog } from '@shared/types/walk';

type DogProfileModalDog = Omit<Dog, 'gender'> & {
  gender: 'male' | 'female' | 'unknown';
  photos?: string[];
  owner: Dog["owner"] & {
    avatar?: string;
  };
};

export interface DogProfileModalProps {
  dog: DogProfileModalDog | null;
  onClose?: () => void;
  onInviteClick?: () => void;
}

export const DogProfileModal: React.FC<DogProfileModalProps> = ({
  dog,
  onClose,
  onInviteClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const images = dog?.photos?.filter(Boolean).length
    ? dog.photos.filter(Boolean)
    : dog?.avatar
      ? [dog.avatar]
      : [];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      setCurrentImageIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (!dog) {
    return null;
  }

  const handleDotClick = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    container.scrollTo({
      left: width * index,
      behavior: 'smooth'
    });
  };

  const healthTags = [];
  if (dog.isSterilized) healthTags.push('Стерилизована');
  if (dog.isVaccinated) healthTags.push('Вакцинирована');
  if (dog.isTreatedForParasites) healthTags.push('Обработана от паразитов');
  const genderLabel =
    dog.gender === 'female'
      ? 'Девочка'
      : dog.gender === 'male'
        ? 'Мальчик'
        : 'Пол не указан';

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-background-secondary">
        <div className="flex flex-col gap-5 px-3 pt-2.5 pb-5">

          <div className="flex justify-between items-center h-[55px]">
            <div className="w-6 h-6 flex items-center justify-center cursor-pointer" onClick={handleClose}>
              <Icon name="arrow-left" size={24} color="var(--color-text-primary)" />
            </div>
            <div className="relative flex flex-col">
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon name="bell" size={24} color="var(--color-text-primary)" />
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
              <style>
                {`
                  .slider-container::-webkit-scrollbar {
                    display: none;
                  }
                  .slider-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                  }
                  .slider-item {
                    scroll-snap-align: center;
                    scroll-snap-stop: always;
                  }
                `}
              </style>
              <div
                ref={scrollContainerRef}
                className="slider-container w-[334px] h-[334px] flex overflow-x-auto overflow-y-hidden gap-3"
              >
                {images.length ? (
                  images.map((image, index) => (
                    <div
                      key={index}
                      className="slider-item w-[334px] h-[334px] flex-shrink-0 rounded-3xl overflow-hidden"
                    >
                      <IonImg
                        src={image}
                        alt={`${dog.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="slider-item w-[334px] h-[334px] flex-shrink-0 rounded-3xl overflow-hidden bg-stone-100 flex flex-col items-center justify-center gap-3 text-text-secondary">
                    <Icon name="camera" size={28} color="var(--color-text-secondary)" />
                    <Text variant="regular-14" color="secondary">
                      Фото пока не добавлено
                    </Text>
                  </div>
                )}
              </div>

              {images.length > 1 ? (
                <div className="flex items-center gap-1.5">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-full cursor-pointer ${
                        index === currentImageIndex
                          ? 'w-[7px] h-[7px] bg-primary'
                          : 'w-[5px] h-[5px] bg-white'
                      }`}
                      onClick={() => handleDotClick(index)}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="w-full flex flex-col gap-1">
              <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <div className="text-text-primary text-2xl font-bold font-['Golos_Text'] leading-6">
                    {dog.name}
                  </div>
                  <div className="text-text-secondary text-sm font-normal font-['Golos_Text'] leading-4">
                    {dog.breed}
                  </div>
                </div>

                <div className="inline-flex justify-start items-start gap-1 flex-wrap">
                  <Tag variant="outline" size="small" className="text-text-secondary outline-border">
                    {genderLabel}
                  </Tag>
                  {dog.age > 0 && (
                    <Tag variant="outline" size="small" className="text-text-secondary outline-border">
                      {dog.age} {dog.age === 1 ? 'год' : dog.age < 5 ? 'года' : 'лет'}
                    </Tag>
                  )}
                  {dog.weight > 0 && (
                    <Tag variant="outline" size="small" className="text-text-secondary outline-border">
                      {dog.weight} кг
                    </Tag>
                  )}
                </div>
              </div>

              {healthTags.length > 0 && (
                <div className="p-5 bg-white rounded-3xl">
                  <div className="inline-flex justify-start items-start gap-1 flex-wrap">
                    {healthTags.map((tag, index) => (
                      <Tag
                        key={index}
                        variant="secondary"
                        size="small"
                        icon={<Icon name="check-filled" size={16} color="#23BA6E" />}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}

              {dog.description && (
                <div className="p-5 bg-white rounded-3xl flex flex-col gap-5">
                  <div className="text-text-primary text-sm font-normal font-['Golos_Text'] leading-4">
                    {dog.description}
                  </div>

                  {(dog.activityLevel || (dog.compatibility && dog.compatibility.length > 0)) && (
                    <div className="inline-flex justify-start items-start gap-1 flex-wrap">
                      {dog.activityLevel && (
                        <Tag variant="outline" size="small" className="text-text-secondary outline-border">
                          {dog.activityLevel}
                        </Tag>
                      )}
                      {dog.compatibility?.map((item, index) => (
                        <Tag key={index} variant="outline" size="small" className="text-text-secondary outline-border">
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
                      {dog.owner.age > 0 && (
                        <>
                          <Text variant="semibold-18" color="primary">
                            ·
                          </Text>
                          <Text variant="semibold-18" color="primary">
                            {dog.owner.age} лет
                          </Text>
                        </>
                      )}
                    </div>
                    <Text variant="regular-14" color="secondary" className="leading-[18px]">
                      Хозяин
                    </Text>
                  </div>

                  <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
                    {dog.owner.avatar ? (
                      <IonImg
                        src={dog.owner.avatar}
                        alt={dog.owner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-text-primary text-lg font-semibold">
                        {dog.owner.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
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
