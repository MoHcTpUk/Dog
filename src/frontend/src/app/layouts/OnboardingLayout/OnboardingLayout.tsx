import React, { ReactNode } from "react";
import { IonImg } from "@ionic/react";
import { Button, Text } from "@shared/ui";
import {
  ONBOARDING_BOTTOM_INSET_STYLE,
  ONBOARDING_SHEET_INSET_CLASS,
} from "@features/onboarding/ui/onboardingLayout.constants";

interface OnboardingLayoutProps {
  image?: string;
  imageAlt?: string;
  icon?: ReactNode;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  image,
  imageAlt = "",
  icon,
  title,
  subtitle,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryClick,
  onSecondaryClick,
}) => {
  return (
    <div className="relative w-full h-full bg-zinc-100 flex flex-col justify-end overflow-hidden">
      {/* Image variant - for pages with image background */}
      {image && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[568px] h-[568px] overflow-hidden">
          <IonImg
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Icon variant - for pages with centered icon */}
      {!image && icon && (
        <div className="flex-1 flex items-center justify-center">
          {icon}
        </div>
      )}

      {/* Bottom content container */}
      <div
        className={`relative z-10 ${ONBOARDING_SHEET_INSET_CLASS} bg-zinc-100 rounded-tl-3xl rounded-tr-3xl`}
        style={ONBOARDING_BOTTOM_INSET_STYLE}
      >
        <div className="px-3 pb-12 flex flex-col items-center gap-5">
          <Text
            variant="extra-bold-28"
            className="text-center text-gray-700"
            tag="div"
          >
            {title}
          </Text>
          <Text
            variant="regular-16"
            className="text-center text-gray-700 leading-tight"
            tag="div"
          >
            {subtitle}
          </Text>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            size="L"
            fullWidth
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </Button>

          <Button
            variant="secondary-white"
            size="L"
            fullWidth
            onClick={onSecondaryClick}
          >
            {secondaryButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
