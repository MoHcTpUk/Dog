import React from "react";
import classNames from "classnames";
import { IonButton } from "@ionic/react";
import { Text } from "../Text";

export interface ButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary-white"
    | "secondary-gray"
    | "secondary"
    | "secondary-pink";
  size?: "M" | "L";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  shadow?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "secondary-white",
  size = "M",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  shadow = false,
  onClick,
  type = "button",
  className,
}) => {
  const getButtonClasses = () => {
    const baseClasses = [
      "rounded-[59px]",
      "inline-flex",
      "justify-center",
      "items-center",
      "text-base",
      "font-medium",
    ];

    // Gap between icon and text
    if (icon && children) {
      baseClasses.push("gap-[2px]");
    }

    // Size-specific padding
    if (size === "L") {
      baseClasses.push("py-[17.5px]");
    } else {
      baseClasses.push("py-3");
    }

    // Horizontal padding based on icon position
    if (icon && children && size === "M") {
      if (iconPosition === "left") {
        baseClasses.push("pl-5", "pr-5");
      } else {
        baseClasses.push("pl-[15px]", "pr-[5px]");
      }
    } else {
      baseClasses.push("px-[30px]");
    }

    // Width
    if (fullWidth) {
      baseClasses.push("w-full");
    }

    // Variant-specific styles
    if (disabled) {
      baseClasses.push("bg-zinc-100", "text-gray-700", "cursor-not-allowed");
    } else {
      switch (variant) {
        case "primary":
          baseClasses.push("bg-primary", "text-white");
          break;
        case "secondary-white":
          baseClasses.push("bg-white", "text-gray-700");
          if (shadow) {
            baseClasses.push("shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]");
          }
          break;
        case "secondary-gray":
          baseClasses.push("bg-zinc-100", "text-gray-700");
          break;
        case "secondary":
          baseClasses.push("bg-white", "text-gray-700");
          break;
        case "secondary-pink":
          baseClasses.push("bg-pink-300", "text-gray-700");
          break;
        default:
          baseClasses.push("bg-white", "text-gray-700");
      }
    }

    return classNames(baseClasses);
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const renderContent = () => {
    const textColor = variant === "primary" ? "white" : undefined;

    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          Loading...
        </>
      );
    }

    // Default buttons with optional icon
    if (icon && children) {
      return iconPosition === "left" ? (
        <>
          {icon}
          <Text variant="medium-16" color={textColor} >
            {children}
          </Text>
        </>
      ) : (
        <>
          <Text variant="medium-16" color={textColor} >
            {children}
          </Text>
          {icon}
        </>
      );
    }

    return (
      icon || (
        <Text variant="medium-16" color={textColor} >
          {children}
        </Text>
      )
    );
  };

  return (
    <IonButton
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={classNames(getButtonClasses(), className)}
      style={
        {
          "--background": "transparent",
          "--background-activated": "transparent",
          "--background-focused": "transparent",
          "--background-hover": "transparent",
          "--color": "inherit",
          "--border-radius": "59px",
          "--box-shadow": "none",
          "--ripple-color": "transparent",
          "--padding-start": "0",
          "--padding-end": "0",
          "--padding-top": "0",
          "--padding-bottom": "0",
          margin: "0",
          height: "auto",
          minHeight: "0",
          contain: "none",
        } as React.CSSProperties
      }
      fill="clear"
    >
      {renderContent()}
    </IonButton>
  );
};
