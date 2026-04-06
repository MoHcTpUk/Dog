import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
  Gender,
  getAgeFromBirthdate,
  type DogProfile,
  useDogById,
} from "@entities/dog";
import { useSessionStore } from "@entities/session";
import { Text } from "@shared/ui";
import {
  DogProfileModal,
  type DogProfileModalProps,
} from "@widgets/DogProfileModal";

const mapDogToModalModel = (
  dog: DogProfile,
  ownerName: string
): NonNullable<DogProfileModalProps["dog"]> => ({
  id: dog.id ?? "",
  name: dog.name,
  breed: dog.species?.name ?? "Порода не указана",
  avatar: dog.avatar ?? "",
  photos: dog.photoUrls,
  gender:
    dog.gender === Gender.Female
      ? "female"
      : dog.gender === Gender.Male
        ? "male"
        : "unknown",
  age: getAgeFromBirthdate(dog.birthdate) ?? 0,
  weight: dog.weight ?? 0,
  description: dog.about ?? undefined,
  activityLevel: undefined,
  compatibility: [],
  owner: {
    id: dog.ownerId ?? "me",
    name: ownerName,
    age: 0,
    avatar: "",
  },
});

export const DogProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { dog, isLoading } = useDogById(id);
  const ownerName = useSessionStore((state) => state.owner?.name ?? "Хозяин");

  if (isLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <Text variant="regular-14" color="muted">
            Загружаем профиль собаки...
          </Text>
        </IonContent>
      </IonPage>
    );
  }

  if (!dog) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <Text variant="regular-14" color="muted">
            Профиль собаки не найден.
          </Text>
        </IonContent>
      </IonPage>
    );
  }

  const handleClose = () => {
    history.goBack();
  };

  const handleInviteClick = () => {
    // TODO: Implement invite logic
    handleClose();
  };

  return (
    <DogProfileModal
      dog={mapDogToModalModel(dog, ownerName)}
      onClose={handleClose}
      onInviteClick={handleInviteClick}
    />
  );
};
