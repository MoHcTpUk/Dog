import React from "react";
import { IonProgressBar } from "@ionic/react";

interface StepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = currentStep / totalSteps;

  return (
    <IonProgressBar
      value={progress}
      className="h-1"
      style={{
        "--background": "white",
        "--progress-background": "#3F335A",
        borderRadius: "2px",
      } as React.CSSProperties}
    />
  );
};
