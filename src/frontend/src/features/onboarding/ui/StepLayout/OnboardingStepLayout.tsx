import React from "react";
import classNames from "classnames";
import { Text } from "@shared/ui";

export interface OnboardingStepLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const OnboardingStepLayout: React.FC<OnboardingStepLayoutProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={classNames("flex w-full flex-col gap-8", className)}>
      <div className="flex flex-col gap-2">
        <Text variant="bold-24" tag="h1" className="text-start">
          {title}
        </Text>
        {description && (
          <Text variant="regular-14" color="muted" className="text-start">
            {description}
          </Text>
        )}
      </div>

      {children}
    </div>
  );
};
