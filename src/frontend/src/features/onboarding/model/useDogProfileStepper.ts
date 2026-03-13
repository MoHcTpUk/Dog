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
import { useAppStore } from "@shared/store/app.store";
import { Activity, Gender } from "@entities/dog";
import { DogProfileData, StepErrors } from "./types";

type StepperToastVariant = "info" | "error" | "success";

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

export const useDogProfileStepper = (
  onComplete: () => void,
  onExit: () => void
) => {
  const { t } = useTranslation();
  const { setOnboarded } = useAppStore();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [stepperData, setStepperData] = useState<DogProfileData>(initialData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState<StepperToastVariant>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createOwner } = usePostOwnersCreate();
  const { mutateAsync: createDog } = usePostDogsCreate();
  const { mutateAsync: bindDogToOwner } = usePostDogsBindToOwner();

  const showToastMessage = (
    message: string,
    variant: StepperToastVariant = "info"
  ) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
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
      const ownerResult = await createOwner({
        data: {
          name: data.owner.name,
          ...(data.owner.birth_date && { birthdate: data.owner.birth_date }),
        },
      });

      const owner = ownerResult?.items?.[0];
      if (!owner?.id) throw new Error("Failed to create owner");

      const { year, month, day } = data.birthDate;
      const birthdate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const dogResult = await createDog({
        data: {
          name: data.name,
          ...(data.gender && { gender: GENDER_MAP[data.gender] }),
          weight: data.weight,
          ...(data.breed && { species: data.breed }),
          birthdate,
          ...(data.character.activity && {
            activity: ACTIVITY_MAP[data.character.activity],
          }),
          about: data.comment || null,
        },
      });

      const dog = dogResult?.items?.[0];
      if (!dog?.id) throw new Error("Failed to create dog");

      await bindDogToOwner({ data: { dogId: dog.id, ownerId: owner.id } });

      await queryClient.invalidateQueries({ queryKey: getGetOwnersGetQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetDogsGetQueryKey() });

      setOnboarded(true);
      showToastMessage(t("Profile created successfully!"), "success");
      setTimeout(() => onComplete(), 1500);
    } catch {
      showToastMessage(t("Failed to create profile. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep, stepperData)) {
      return;
    }

    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    } else {
      submitProfile(stepperData);
    }
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
