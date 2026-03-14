import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  mapDogProfileToCurrentDog,
  type DogProfile,
  useMyDogs,
} from "@entities/dog";
import { useSessionStore } from "@entities/session";
import { Icon, Text } from "@shared/ui";
import { MainLayout } from "@widgets/layout";

const DOG_PLACEHOLDER_IMAGE = "https://placehold.co/384x384?text=Dog";

interface DogCardProps {
  dog: DogProfile;
  onClick: (dog: DogProfile) => void;
}

const DogCard: React.FC<DogCardProps> = ({ dog, onClick }) => {
  const subtitle = dog.species?.name ?? "Порода не указана";
  const secondaryLine = dog.weight ? `${dog.weight} кг` : "Фото пока нет";

  return (
    <div
      className="w-full px-2 pt-2 pb-5 bg-white rounded-3xl flex flex-col justify-end items-center gap-5 overflow-hidden cursor-pointer"
      onClick={() => onClick(dog)}
    >
      <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
        <div className="self-stretch rounded-2xl overflow-hidden h-60">
          <img
            className="w-full h-60 object-cover"
            src={dog.avatar ?? DOG_PLACEHOLDER_IMAGE}
            alt={dog.name}
          />
        </div>
        <div className="self-stretch px-3 inline-flex justify-start items-center gap-2.5">
          <div className="flex-1 inline-flex flex-col justify-center items-start gap-[5px]">
            <Text variant="semibold-18" color="primary">
              {dog.name}
            </Text>
            <Text variant="regular-14" color="muted" className="leading-4">
              {subtitle}
            </Text>
            <Text variant="regular-14" color="muted" className="leading-4">
              {secondaryLine}
            </Text>
          </div>
          <div className="p-2 -rotate-90 bg-zinc-100 rounded-full inline-flex flex-col justify-start items-start overflow-hidden">
            <div className="rotate-90">
              <Icon name="arrow-right" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DogsPage: React.FC = () => {
  const history = useHistory();
  const setCurrentDog = useSessionStore((state) => state.setCurrentDog);
  const { dogs, isLoading } = useMyDogs();
  const [notificationCount] = useState(2);

  const handleNotificationClick = () => {
    history.push("/notifications");
  };

  const handleDogClick = (dog: DogProfile) => {
    setCurrentDog(mapDogProfileToCurrentDog(dog));

    if (dog.id) {
      history.push(`/dog/${dog.id}`);
    }
  };

  return (
    <MainLayout withFooter>
      <div className="px-3 py-5 flex flex-col justify-start items-start gap-8">
        <div className="self-stretch h-14 pl-2.5 inline-flex justify-between items-center">
          <Text variant="bold-24" color="primary" className="flex-1 leading-6">
            Мои собаки
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

        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          {isLoading ? (
            <Text variant="regular-14" color="muted">
              Загружаем профили собак...
            </Text>
          ) : null}

          {!isLoading && dogs.length === 0 ? (
            <Text variant="regular-14" color="muted">
              У вас пока нет добавленных собак.
            </Text>
          ) : null}

          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {dogs.map((dog) => (
              <DogCard
                key={dog.id ?? dog.name}
                dog={dog}
                onClick={handleDogClick}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
