import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";

interface StepperNavigationProps {
  onBack: () => void;
  onNext: () => void;
  nextButtonText?: string;
  backButtonText?: string;
  className?: string;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  onBack,
  onNext,
  nextButtonText,
  backButtonText,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`stepper-navigation w-full flex gap-2.5 z-10 safe-area-bottom ${className}`}
      style={{ padding: "0px 16px 40px" }}
    >
      <Button
        variant="secondary-white"
        size="L"
        fullWidth
        onClick={onBack}
        className="text-[#3F335A]"
      >
        {backButtonText || t("Back")}
      </Button>

      <Button
        variant="primary"
        size="L"
        fullWidth
        onClick={onNext}
        className="bg-[#3F335A] hover:bg-[#342B47]"
      >
        {nextButtonText || t("Next")}
      </Button>
    </div>
  );
};
