import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
  Gender,
  getAgeFromBirthdate,
  type DogProfile,
  useDogById,
} from "@entities/dog";
import { useMyOwner } from "@entities/owner";
import { Text } from "@shared/ui";
import {
  DogProfileModal,
  type DogProfileModalProps,
} from "@widgets/DogProfileModal";

const DOG_PLACEHOLDER_IMAGE = "https://placehold.co/384x384?text=Dog";
const OWNER_PLACEHOLDER_IMAGE = "https://placehold.co/120x120?text=Owner";

const mapDogToModalModel = (
  dog: DogProfile,
  ownerName: string
): NonNullable<DogProfileModalProps["dog"]> => ({
  id: dog.id ?? "",
  name: dog.name,
  breed: dog.species?.name ?? "Порода не указана",
  avatar: dog.avatar ?? DOG_PLACEHOLDER_IMAGE,
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
    avatar: OWNER_PLACEHOLDER_IMAGE,
  },
});

export const DogProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { dog, isLoading } = useDogById(id);
  const { owner } = useMyOwner();

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
      dog={mapDogToModalModel(dog, owner?.name ?? "Хозяин")}
      onClose={handleClose}
      onInviteClick={handleInviteClick}
    />
  );
};
