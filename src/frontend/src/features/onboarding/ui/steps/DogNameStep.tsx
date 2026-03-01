import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepLayout } from "../StepLayout";

interface DogNameStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const DogNameStep: React.FC<DogNameStepProps> = ({
  data,
  errors,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingStepLayout title={t("What is your pet's name?")}>
      <Input
        placeholder={t("Pet name")}
        value={data.name}
        maxLength={30}
        error={errors.name}
        className="border-0 bg-transparent p-0 h-auto"
        onInput={(value) => {
          onUpdate({
            name: value.charAt(0).toUpperCase() + value.slice(1),
          });
        }}
      />
    </OnboardingStepLayout>
  );
};
