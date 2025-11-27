import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Text } from "@shared/ui";

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
    <div className="flex flex-col h-full">
      <div className="p-6 text-center flex-1 flex flex-col justify-center">
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
            <div className="text-4xl">🛡️</div>
          </div>

          <div className="space-y-4">
            <Text variant="bold-24" tag="h1" className="text-center">
              {t("We care about safety")}
            </Text>
            <Text variant="regular-16" className="text-center" color="secondary">
              {t("Complete verification to access all features")}
            </Text>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Button
          variant="primary"
          size="large"
          fullWidth
          onClick={onVerify}
        >
{t("Complete Verification")}
        </Button>

        <Button
          variant="outline"
          size="large"
          fullWidth
          onClick={onSkip}
        >
{t("Skip for Now")}
        </Button>
      </div>
    </div>
  );
};