import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TagRadioGroup, TagRadioOption, Input } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepField, OnboardingStepLayout } from "../StepLayout";

const mockBreeds = [
  "Лабрадор",
  "Немецкая овчарка",
  "Золотистый ретривер",
  "Французский бульдог",
  "Бульдог",
  "Пудель",
  "Бигль",
  "Ротвейлер",
  "Йоркширский терьер",
  "Далматин",
];

interface DogBreedStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const DogBreedStep: React.FC<DogBreedStepProps> = ({
  data,
  errors,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");

  const filteredBreeds = mockBreeds.filter((breed) =>
    breed.toLowerCase().includes(searchValue.toLowerCase())
  );

  const breedOptions: TagRadioOption[] = filteredBreeds.map((breed) => ({
    value: breed,
    label: t(breed),
  }));

  const handleBreedChange = (value: string) => {
    onUpdate({ breed: value });
  };

  return (
    <OnboardingStepLayout title={t("Breed")}>
      <Input
        placeholder={t("Start typing breed")}
        value={searchValue}
        onInput={setSearchValue}
      />

      <TagRadioGroup
        options={breedOptions}
        value={data.breed || ""}
        onChange={handleBreedChange}
        size="medium"
        className="justify-start"
      />

      <OnboardingStepField
        error={errors.breed ? t("Please select your pet's breed") : undefined}
        errorAlign="center"
        className="gap-0"
      >
        {null}
      </OnboardingStepField>
    </OnboardingStepLayout>
  );
};
