import React from "react";
import { useTranslation } from "react-i18next";
import { TagRadioGroup, TagRadioOption } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepField, OnboardingStepLayout } from "../StepLayout";

interface DogGenderStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const DogGenderStep: React.FC<DogGenderStepProps> = ({
  data,
  errors,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const genderOptions: TagRadioOption[] = [
    { value: "male", label: t("Boy") },
    { value: "female", label: t("Girl") },
  ];

  const handleGenderChange = (value: string) => {
    onUpdate({ gender: value as "male" | "female" });
  };

  return (
    <OnboardingStepLayout title={t("Pet Gender")}>
      <OnboardingStepField error={errors.gender}>
        <TagRadioGroup
          options={genderOptions}
          value={data.gender || ""}
          onChange={handleGenderChange}
          className="justify-start"
          hasError={!!errors.gender}
        />
      </OnboardingStepField>
    </OnboardingStepLayout>
  );
};
