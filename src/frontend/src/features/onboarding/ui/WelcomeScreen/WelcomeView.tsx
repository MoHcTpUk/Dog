import React from "react";
import { useTranslation } from "react-i18next";
import { OnboardingLayout } from "@widgets/layout";
import startPageDog from "@shared/assets/images/welcome/startPageDog.webp";

interface WelcomeViewProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onCreateAccount,
  onSignIn,
}) => {
  const { t } = useTranslation();
  return (
    <OnboardingLayout
      image={startPageDog}
      imageAlt="Welcome dog"
      title={t("Dog appa")}
      subtitle={t("Find company for walks and a map of dog-friendly places")}
      primaryButtonText={t("Create Account")}
      secondaryButtonText={t("Sign In")}
      onPrimaryClick={onCreateAccount}
      onSecondaryClick={onSignIn}
    />
  );
};
