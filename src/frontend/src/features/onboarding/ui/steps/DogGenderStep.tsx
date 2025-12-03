import React from "react";
import { useTranslation } from "react-i18next";
import { TagRadioGroup, TagRadioOption, Text } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";

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
    <div className="flex flex-col gap-8">
      <Text variant="bold-24" tag="h1" className="text-start">
        {t("Pet Gender")}
      </Text>

      <div className="flex flex-col gap-1.5">
        <TagRadioGroup
          options={genderOptions}
          value={data.gender || ""}
          onChange={handleGenderChange}
          className="justify-start"
          hasError={!!errors.gender}
        />
        {errors.gender && (
          <Text variant="medium-14" color="error" className="text-start">
            {errors.gender}
          </Text>
        )}
      </div>
    </div>
  );
};
