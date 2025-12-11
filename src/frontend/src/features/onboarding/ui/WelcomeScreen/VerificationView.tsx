import React from "react";
import { useTranslation } from "react-i18next";
import { IonIcon } from "@ionic/react";
import { shieldCheckmark } from "ionicons/icons";
import { OnboardingLayout } from "@app/layouts/OnboardingLayout";

interface VerificationViewProps {
  onVerify: () => void;
  onSkip: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  onVerify,
  onSkip,
}) => {
  const { t } = useTranslation();
  return (
    <OnboardingLayout
      icon={
        <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center">
          <IonIcon icon={shieldCheckmark} className="text-5xl text-secondary" />
        </div>
      }
      title={t("We care about safety")}
      subtitle={t("Complete verification to access all features")}
      primaryButtonText={t("Complete Verification")}
      secondaryButtonText={t("Skip for Now")}
      onPrimaryClick={onVerify}
      onSecondaryClick={onSkip}
    />
  );
};