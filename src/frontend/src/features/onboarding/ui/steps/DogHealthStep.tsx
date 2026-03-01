import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepLayout } from "../StepLayout";

interface DogHealthStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const DogHealthStep: React.FC<DogHealthStepProps> = ({
  data,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const handleHealthChange = (key: string, checked: boolean) => {
    onUpdate({
      health: {
        ...data.health,
        [key]: checked,
      },
    });
  };

  return (
    <OnboardingStepLayout title={t("Health Information")}>
      <div className="space-y-1">
        <Checkbox
          label={t("Spayed/Neutered")}
          checked={data.health.sterilized || false}
          onChange={(checked) => handleHealthChange("sterilized", checked)}
        />

        <Checkbox
          label={t("Vaccinated")}
          checked={data.health.vaccinated || false}
          onChange={(checked) => handleHealthChange("vaccinated", checked)}
        />

        <Checkbox
          label={t("Parasite treated")}
          checked={data.health.parasite_treated || false}
          onChange={(checked) =>
            handleHealthChange("parasite_treated", checked)
          }
        />
      </div>
    </OnboardingStepLayout>
  );
};
