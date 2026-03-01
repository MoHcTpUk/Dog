import React from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@shared/ui";
import { DogProfileData, StepErrors } from "../../model/types";
import { OnboardingStepLayout } from "../StepLayout";

interface DogCommentStepProps {
  data: DogProfileData;
  errors: StepErrors;
  onUpdate: (updates: Partial<DogProfileData>) => void;
}

export const DogCommentStep: React.FC<DogCommentStepProps> = ({
  data,
  onUpdate,
}) => {
  const { t } = useTranslation();

  return (
    <OnboardingStepLayout title={t("Tell us about your pet")}>
      <Textarea
        placeholder={t("Tell what other owners should know before walks")}
        value={data.comment}
        rows={4}
        showCharCount
        onInput={(value) => onUpdate({ comment: value })}
      />
    </OnboardingStepLayout>
  );
};
