import React from "react";
import { useTranslation } from "react-i18next";
import { OnboardingLayout } from "@widgets/layout";
import startPageDog from "@shared/assets/images/welcome/startPageDog.webp";

interface StepperIntroViewProps {
  onNext: () => void;
  onSkip: () => void;
}

export const StepperIntroView: React.FC<StepperIntroViewProps> = ({
  onNext,
  onSkip,
}) => {
  const { t } = useTranslation();
  return (
    <OnboardingLayout
      image={startPageDog}
      imageAlt="Dog"
      title={t("Tell us about dog")}
      subtitle={t("This will help find suitable friends for walks")}
      primaryButtonText={t("Create Profile")}
      secondaryButtonText={t("Fill Later")}
      onPrimaryClick={onNext}
      onSecondaryClick={onSkip}
    />
  );
};
