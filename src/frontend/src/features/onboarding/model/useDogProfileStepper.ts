import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePostOwnersCreate,
  usePostDogsCreate,
  usePostDogsBindToOwner,
  getGetOwnersGetQueryKey,
  getGetDogsGetQueryKey,
} from "@shared/api/generated";
import type {
  CreateDogCommandType,
  CreateOwnerCommandType,
  UpdateDogCommandType,
  UpdateOwnerCommandType,
} from "@shared/api/generated/types";
import {
  Activity,
  Gender,
  getAgeFromBirthdate,
  useRemoveDogPhoto,
  useUpdateDog,
  useUploadDogPhoto,
} from "@entities/dog";
import { useUpdateOwner } from "@entities/owner";
import { useSessionStore } from "@entities/session";
import { DogProfileData, StepErrors } from "./types";

type StepperToastVariant = "info" | "error" | "success";
type UploadedDogPhoto = { source: string; photoId: string };

const getCurrentDate = () => {
  const today = new Date();
  return {
    day: today.getDate(),
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  };
};

const initialData: DogProfileData = {
  name: "",
  gender: "",
  weight: 20,
  breed: null,
  birthDate: getCurrentDate(),
  health: {
    sterilized: false,
    vaccinated: false,
    parasite_treated: false,
  },
  character: {
    activity: "",
    comfortable_with: {
      big_dogs: false,
      small_dogs: false,
      same_size: false,
      males: false,
      females: false,
    },
  },
  comment: "",
  photos: [],
  owner: {
    photo: null,
    name: "",
    birth_date: null,
  },
};

const GENDER_MAP: Record<string, number> = {
  male: Gender.Male,
  female: Gender.Female,
};

const ACTIVITY_MAP: Record<string, number> = {
  low: Activity.Low,
  medium: Activity.Medium,
  high: Activity.High,
};

const getDogBirthdate = (data: DogProfileData) => {
  const { year, month, day } = data.birthDate;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const buildDogPayload = (
  data: DogProfileData,
  step: number
): CreateDogCommandType => {
  const payload: CreateDogCommandType = {
    name: data.name.trim(),
  };

  if (step >= 2 && data.gender) {
    payload.gender = GENDER_MAP[data.gender];
  }

  if (step >= 3) {
    payload.weight = data.weight;
  }

  if (step >= 4 && data.breed) {
    payload.species = data.breed;
  }

  if (step >= 5) {
    payload.birthdate = getDogBirthdate(data);
  }

  if (step >= 7 && data.character.activity) {
    payload.activity = ACTIVITY_MAP[data.character.activity];
  }

  if (step >= 8) {
    payload.about = data.comment || null;
  }

  return payload;
};

const buildOwnerPayload = (
  data: DogProfileData
): CreateOwnerCommandType => ({
  name: data.owner.name.trim(),
  ...(data.owner.birth_date && { birthdate: data.owner.birth_date }),
});

export const useDogProfileStepper = (
  onComplete: () => void,
  onExit: () => void
) => {
  const { t } = useTranslation();
  const { setOnboarded, setOwner, setCurrentDog } = useSessionStore();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [stepperData, setStepperData] = useState<DogProfileData>(initialData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<StepperToastVariant>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftDogId, setDraftDogId] = useState<string | null>(null);
  const [draftOwnerId, setDraftOwnerId] = useState<string | null>(null);
  const [isDogBoundToOwner, setIsDogBoundToOwner] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedDogPhoto[]>([]);

  const { mutateAsync: createOwner } = usePostOwnersCreate();
  const { mutateAsync: createDog } = usePostDogsCreate();
  const { mutateAsync: bindDogToOwner } = usePostDogsBindToOwner();
  const { updateDog } = useUpdateDog();
  const { updateOwner } = useUpdateOwner();
  const { uploadPhoto } = useUploadDogPhoto();
  const { removePhoto } = useRemoveDogPhoto();

  const showToastMessage = (
    message: string,
    variant: StepperToastVariant = "info"
  ) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const syncCurrentDog = (dogId: string, data: DogProfileData) => {
    setCurrentDog({
      id: dogId,
      name: data.name.trim(),
      avatar: null,
      breed: data.breed?.name ?? null,
      age: getAgeFromBirthdate(getDogBirthdate(data)),
    });
  };

  const persistDog = async (step: number, data: DogProfileData) => {
    const dogPayload = buildDogPayload(data, step);

    if (!draftDogId) {
      const dogResult = await createDog({ data: dogPayload });
      const dog = dogResult?.items?.[0];

      if (!dog?.id) {
        throw new Error("Failed to create dog");
      }

      setDraftDogId(dog.id);
      syncCurrentDog(dog.id, data);
      return dog.id;
    }

    const dogResult = await updateDog({
      ...(dogPayload as UpdateDogCommandType),
      id: draftDogId,
    });
    const dog = dogResult?.items?.[0];
    const dogId = dog?.id ?? draftDogId;

    syncCurrentDog(dogId, data);
    return dogId;
  };

  const persistOwner = async (data: DogProfileData) => {
    const ownerPayload = buildOwnerPayload(data);

    if (!draftOwnerId) {
      const ownerResult = await createOwner({ data: ownerPayload });
      const owner = ownerResult?.items?.[0];

      if (!owner?.id) {
        throw new Error("Failed to create owner");
      }

      setDraftOwnerId(owner.id);
      setOwner({
        id: owner.id,
        name: owner.name,
        birthdate: owner.birthdate ?? null,
      });
      return owner.id;
    }

    const ownerResult = await updateOwner({
      ...(ownerPayload as UpdateOwnerCommandType),
      id: draftOwnerId,
    });
    const owner = ownerResult?.items?.[0];
    const ownerId = owner?.id ?? draftOwnerId;

    setOwner({
      id: ownerId,
      name: owner?.name ?? ownerPayload.name,
      birthdate: owner?.birthdate ?? ownerPayload.birthdate ?? null,
    });

    return ownerId;
  };

  const syncDogPhotos = async (dogId: string, photos: string[]) => {
    const nextSources = new Set(photos);
    const photosToRemove = uploadedPhotos.filter(
      (photo) => !nextSources.has(photo.source)
    );

    for (const photo of photosToRemove) {
      await removePhoto(dogId, photo.photoId);
    }

    const remainingPhotos = uploadedPhotos.filter((photo) =>
      nextSources.has(photo.source)
    );
    const uploadedSources = new Set(
      remainingPhotos.map((photo) => photo.source)
    );

    const nextUploadedPhotos = [...remainingPhotos];

    for (const source of photos) {
      if (uploadedSources.has(source)) {
        continue;
      }

      const uploadedPhoto = await uploadPhoto(dogId, source);
      nextUploadedPhotos.push({
        source,
        photoId: uploadedPhoto.id,
      });
    }

    setUploadedPhotos(nextUploadedPhotos);
  };

  const persistCurrentStep = async (step: number, data: DogProfileData) => {
    const dogId = await persistDog(Math.min(step, 9), data);

    if (step === 9) {
      await syncDogPhotos(dogId, data.photos);
      return;
    }

    if (step !== 10) {
      return;
    }

    const ownerId = await persistOwner(data);

    if (!isDogBoundToOwner || draftOwnerId !== ownerId) {
      await bindDogToOwner({
        data: {
          dogId,
          ownerId,
        },
      });
      setIsDogBoundToOwner(true);
    }

    await queryClient.invalidateQueries({
      queryKey: getGetOwnersGetQueryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: getGetDogsGetQueryKey(),
    });
  };

  const updateStepperData = (updates: Partial<DogProfileData>) => {
    setStepperData((prev) => ({ ...prev, ...updates }));

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      let hasChanges = false;

      if (updates.name !== undefined && newErrors.name) {
        delete newErrors.name;
        hasChanges = true;
      }
      if (updates.gender !== undefined && newErrors.gender) {
        delete newErrors.gender;
        hasChanges = true;
      }
      if (updates.breed !== undefined && newErrors.breed) {
        delete newErrors.breed;
        hasChanges = true;
      }
      if (updates.owner?.name !== undefined && newErrors.ownerName) {
        delete newErrors.ownerName;
        hasChanges = true;
      }

      return hasChanges ? newErrors : prevErrors;
    });
  };

  const validateStep = (
    step: number,
    currentData?: DogProfileData
  ): boolean => {
    const dataToValidate = currentData || stepperData;
    const newErrors: StepErrors = {};

    switch (step) {
      case 1:
        if (!dataToValidate.name.trim()) {
          newErrors.name = t("Please enter your pet's name");
          setErrors(newErrors);
          return false;
        }
        break;
      case 2:
        if (!dataToValidate.gender) {
          newErrors.gender = t("Please select your pet's gender");
          setErrors(newErrors);
          return false;
        }
        break;
      case 4:
        if (!dataToValidate.breed) {
          showToastMessage(t("Please select a breed to continue"), "info");
          return false;
        }
        break;
      case 10:
        if (!dataToValidate.owner.name.trim()) {
          newErrors.ownerName = t("Please enter your name");
          setErrors(newErrors);
          return false;
        }
        break;
    }

    setErrors({});
    return true;
  };

  const submitProfile = async (data: DogProfileData) => {
    setIsSubmitting(true);

    try {
      await persistCurrentStep(currentStep, data);
      setOnboarded(true);
      showToastMessage(t("Profile created successfully!"), "success");
      setTimeout(() => onComplete(), 1500);
    } catch (error) {
      console.error("Failed to persist onboarding step:", error);
      showToastMessage(
        currentStep === 10
          ? t("Failed to create profile. Please try again.")
          : t("Failed to save progress. Please try again."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validateStep(currentStep, stepperData)) {
      return;
    }

    if (currentStep < 10) {
      setIsSubmitting(true);

      try {
        await persistCurrentStep(currentStep, stepperData);
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Failed to persist onboarding step:", error);
        showToastMessage(t("Failed to save progress. Please try again."), "error");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    submitProfile(stepperData);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onExit();
    }
  };

  return {
    currentStep,
    stepperData,
    errors,
    showToast,
    toastMessage,
    toastVariant,
    isSubmitting,
    handleNext,
    handleBack,
    updateStepperData,
    setShowToast,
    showToastMessage,
    setCurrentStep,
  };
};

export type { DogProfileData };
