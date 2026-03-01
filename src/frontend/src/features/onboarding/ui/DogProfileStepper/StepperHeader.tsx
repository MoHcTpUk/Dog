import React from "react";
import { Icon } from "@shared/ui";

interface StepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex w-full justify-start items-center gap-[5px] py-0.5">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const color = step === currentStep ? "#3F335A" : "#FFFFFF";

        return (
          <Icon
            key={step}
            name="stepper-segment"
            width={30.5}
            height={4}
            color={color}
          />
        );
      })}
    </div>
  );
};
