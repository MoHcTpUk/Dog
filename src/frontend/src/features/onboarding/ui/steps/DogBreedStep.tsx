import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDogSpecies } from "@entities/dog";
import { TagRadioGroup, TagRadioOption, Input } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepField, OnboardingStepLayout } from "../StepLayout";

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
  const { species } = useDogSpecies();

  const filteredSpecies = species.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const breedOptions: TagRadioOption[] = filteredSpecies.map((item) => ({
    value: String(item.value),
    label: item.name,
  }));

  const handleBreedChange = (value: string) => {
    const selectedSpecies =
      species.find((item) => String(item.value) === value) ?? null;

    onUpdate({ breed: selectedSpecies });
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
        value={data.breed ? String(data.breed.value) : ""}
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
