import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Activity,
  Gender,
  type DogProfile,
  mapDogPhotoIdsToEntries,
  useMyDogs,
  useRemoveDogPhoto,
  useUpdateDog,
  useUploadDogPhoto,
} from "@entities/dog";
import { useSessionStore } from "@entities/session";
import { useMyOwner, useUpdateOwner } from "@entities/owner";
import {
  DogEditForm,
  type DogFormData,
  OwnerEditForm,
  type OwnerFormData,
} from "@features/profile";
import { Icon, Text } from "@shared/ui";
import { parseDateParts } from "@shared/utils/date.utils";
import { MainLayout } from "@widgets/layout";
import { ProfileTabSwitcher, ProfileTab } from "@widgets/ProfileTabSwitcher";
import { syncDogPhotos } from "@entities/dog/model/dog.photos";
import { mapDogProfileToCurrentDog } from "@entities/dog";

const DEFAULT_DATE_PARTS = {
  day: 1,
  month: 1,
  year: new Date().getFullYear(),
};

const mapGenderToFormValue = (gender: Gender) => {
  if (gender === Gender.Male) {
    return "male";
  }

  if (gender === Gender.Female) {
    return "female";
  }

  return "";
};

const mapActivityToFormValue = (activity: Activity | null) => {
  if (activity === Activity.Low) {
    return "low";
  }

  if (activity === Activity.Medium) {
    return "medium";
  }

  if (activity === Activity.High) {
    return "high";
  }

  return "";
};

const toIsoDate = (value?: string, fallback?: string | null) => {
  const parsed = parseDateParts(value || fallback || null, {
    fallback: DEFAULT_DATE_PARTS,
  });

  return `${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(
    parsed.day
  ).padStart(2, "0")}`;
};

const getEditableDog = (
  dogs: DogProfile[],
  currentDogId: string | null | undefined
) => {
  if (!dogs.length) {
    return null;
  }

  if (!currentDogId) {
    return dogs[0];
  }

  return dogs.find((dog) => dog.id === currentDogId) ?? dogs[0];
};

export const EditProfilePage: React.FC = () => {
  const history = useHistory();
  const currentDogId = useSessionStore((state) => state.currentDog?.id);
  const setCurrentDog = useSessionStore((state) => state.setCurrentDog);
  const setOwner = useSessionStore((state) => state.setOwner);
  const [activeTab, setActiveTab] = useState<ProfileTab>("dog");
  const [notificationCount] = useState(2);

  const ownerFromStore = useSessionStore((state) => state.owner);
  const { owner: fetchedOwner } = useMyOwner();
  const { dogs, isLoading: isDogsLoading } = useMyDogs();
  const { updateDog, isPending: isDogSaving } = useUpdateDog();
  const { uploadPhoto, isPending: isPhotoUploading } = useUploadDogPhoto();
  const { removePhoto, isPending: isPhotoRemoving } = useRemoveDogPhoto();
  const { updateOwner, isPending: isOwnerSaving } = useUpdateOwner();
  const owner = ownerFromStore ?? fetchedOwner;

  const editableDog = getEditableDog(dogs, currentDogId);

  const handleNotificationClick = () => {
    history.push("/notifications");
  };

  const handleBack = () => {
    history.goBack();
  };

  const handleSaveDog = async (data: DogFormData) => {
    if (!editableDog?.id) {
      return;
    }

    const nextWeight =
      editableDog.weight == null && data.weight === 20
        ? undefined
        : data.weight ?? editableDog.weight ?? undefined;

    const updateResult = await updateDog({
      id: editableDog.id,
      name: data.name?.trim() || editableDog.name,
      ...(data.gender === "male" && { gender: Gender.Male }),
      ...(data.gender === "female" && { gender: Gender.Female }),
      ...(data.gender !== undefined &&
        data.gender !== "male" &&
        data.gender !== "female" && { gender: Gender.Unknown }),
      weight: nextWeight,
      ...(data.breed ? { species: data.breed } : {}),
      ...(data.birthDate || editableDog.birthdate
        ? { birthdate: toIsoDate(data.birthDate, editableDog.birthdate) }
        : {}),
      ...(data.character?.activity === "low" && { activity: Activity.Low }),
      ...(data.character?.activity === "medium" && {
        activity: Activity.Medium,
      }),
      ...(data.character?.activity === "high" && { activity: Activity.High }),
      ...(data.character?.activity === "" && { activity: undefined }),
      about: data.comment?.trim() || null,
    });

    const nextPhotos = await syncDogPhotos({
      dogId: editableDog.id,
      nextSources: data.photos ?? [],
      existingPhotos: mapDogPhotoIdsToEntries(editableDog.photoIds),
      uploadPhoto,
      removePhoto,
    });
    const updatedDog = updateResult?.items?.[0];
    const nextDog: DogProfile = {
      ...editableDog,
      name: updatedDog?.name ?? (data.name?.trim() || editableDog.name),
      gender:
        updatedDog?.gender === Gender.Male || updatedDog?.gender === Gender.Female
          ? updatedDog.gender
          : data.gender === "male"
            ? Gender.Male
            : data.gender === "female"
              ? Gender.Female
              : editableDog.gender,
      weight: updatedDog?.weight ?? nextWeight ?? null,
      species: data.breed ?? editableDog.species,
      birthdate:
        updatedDog?.birthdate ??
        (data.birthDate || editableDog.birthdate
          ? toIsoDate(data.birthDate, editableDog.birthdate)
          : null),
      activity:
        updatedDog?.activity ??
        (data.character?.activity === "low"
          ? Activity.Low
          : data.character?.activity === "medium"
            ? Activity.Medium
            : data.character?.activity === "high"
              ? Activity.High
              : data.character?.activity === ""
                ? null
                : editableDog.activity),
      about: updatedDog?.about ?? (data.comment?.trim() || null),
      photoIds: nextPhotos
        .map((photo) => photo.photoId)
        .filter((photoId): photoId is string => Boolean(photoId)),
      photoUrls: nextPhotos.map((photo) => photo.source),
      avatar: nextPhotos[0]?.source ?? null,
    };

    setCurrentDog(mapDogProfileToCurrentDog(nextDog));
    history.goBack();
  };

  const handleSaveOwner = async (data: OwnerFormData) => {
    if (!owner?.id) {
      return;
    }

    const updateResult = await updateOwner({
      id: owner.id,
      name: data.name?.trim() || owner.name,
      ...(data.birth_date || owner.birthdate
        ? { birthdate: toIsoDate(data.birth_date, owner.birthdate) }
        : {}),
    });

    const updatedOwner = updateResult?.items?.[0];
    setOwner({
      id: owner.id,
      name: updatedOwner?.name ?? (data.name?.trim() || owner.name),
      birthdate:
        updatedOwner?.birthdate ??
        (data.birth_date || owner.birthdate
          ? toIsoDate(data.birth_date, owner.birthdate)
          : null),
    });

    history.goBack();
  };

  const dogInitialData: DogFormData | undefined = editableDog
    ? {
        photos: editableDog.photoUrls,
        gender: mapGenderToFormValue(editableDog.gender),
        name: editableDog.name,
        weight: editableDog.weight ?? undefined,
        breed: editableDog.species,
        birthDate: editableDog.birthdate ?? undefined,
        character: {
          activity: mapActivityToFormValue(editableDog.activity),
        },
        comment: editableDog.about ?? "",
      }
    : undefined;

  const ownerInitialData: OwnerFormData | undefined = owner
    ? {
        photo: null,
        name: owner.name,
        birth_date: owner.birthdate ?? undefined,
      }
    : undefined;

  return (
    <MainLayout withFooter>
      <div className="self-stretch px-3 py-5 inline-flex flex-col justify-start items-start gap-8 w-full">
        <div className="self-stretch h-14 inline-flex justify-between items-center">
          <div
            className="p-2 -rotate-90 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)] inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={handleBack}
          >
            <div className="rotate-90">
              <Icon name="arrow-left" size={24} />
            </div>
          </div>

          <ProfileTabSwitcher activeTab={activeTab} onChange={setActiveTab} />

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

        <div className="self-stretch relative">
          <div
            className={`transition-opacity duration-300 ${
              activeTab === "dog"
                ? "opacity-100"
                : "opacity-0 pointer-events-none absolute top-0 left-0 right-0"
            }`}
          >
            {isDogsLoading ? (
              <Text variant="regular-14" color="muted">
                Загружаем профиль собаки...
              </Text>
            ) : editableDog ? (
              <DogEditForm
                initialData={dogInitialData}
                onSave={handleSaveDog}
                isSaving={isDogSaving || isPhotoUploading || isPhotoRemoving}
              />
            ) : (
              <Text variant="regular-14" color="muted">
                Нет данных для редактирования собаки.
              </Text>
            )}
          </div>
          <div
            className={`transition-opacity duration-300 ${
              activeTab === "owner"
                ? "opacity-100"
                : "opacity-0 pointer-events-none absolute top-0 left-0 right-0"
            }`}
          >
            {!owner ? (
              <Text variant="regular-14" color="muted">
                Загружаем профиль хозяина...
              </Text>
            ) : owner ? (
              <OwnerEditForm
                initialData={ownerInitialData}
                onSave={handleSaveOwner}
                isSaving={isOwnerSaving}
              />
            ) : (
              <Text variant="regular-14" color="muted">
                Нет данных для редактирования хозяина.
              </Text>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
