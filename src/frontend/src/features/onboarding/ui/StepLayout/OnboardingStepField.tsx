import React from "react";
import classNames from "classnames";
import { Text } from "@shared/ui";

export interface OnboardingStepFieldProps {
  label?: string;
  error?: string;
  errorAlign?: "start" | "center";
  children: React.ReactNode;
  className?: string;
}

export const OnboardingStepField: React.FC<OnboardingStepFieldProps> = ({
  label,
  error,
  errorAlign = "start",
  children,
  className,
}) => {
  return (
    <div className={classNames("flex w-full flex-col gap-3.5", className)}>
      {label && (
        <Text variant="medium-16" className="text-start">
          {label}
        </Text>
      )}

      {children}

      {error && (
        <Text
          variant="medium-14"
          color="error"
          className={errorAlign === "center" ? "text-center" : "text-start"}
        >
          {error}
        </Text>
      )}
    </div>
  );
};
