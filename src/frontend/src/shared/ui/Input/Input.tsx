import React, { useState } from "react";
import classNames from "classnames";
import { IonInput } from "@ionic/react";

export interface InputProps {
  placeholder?: string;
  value?: string | number;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date";
  disabled?: boolean;
  error?: string;
  maxLength?: number;
  onInput?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  value = "",
  type = "text",
  disabled = false,
  error,
  maxLength,
  onInput,
  onBlur,
  onFocus,
  className,
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value !== "" && value !== undefined && value !== null;
  const hasError = !!error;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  // Wrapper classes based on state
  const wrapperClasses = classNames(
    "w-full h-16 p-5 bg-white rounded-2xl inline-flex flex-col justify-center items-center overflow-hidden",
  );

  // Text classes based on state
  const textClasses = classNames(
    "text-base font-normal font-sans leading-5 line-clamp-1 w-full transition-colors duration-200 ease-in-out",
    {
      "text-text-primary": hasValue || focused,
      "text-text-muted": !hasValue && !focused,
    }
  );

  const getBorderColor = () => {
    if (hasError) return "var(--color-error)";
    if (focused) return "var(--color-info)";
    return "transparent";
  };

  return (
    <div className={classNames("flex flex-col gap-1.5 w-full", className)}>
      <div
        className={wrapperClasses}
        style={{
          boxShadow: `inset 0 0 0 1px ${getBorderColor()}`,
          transition: "box-shadow 300ms ease-in-out",
        }}
      >
        <div className="w-full inline-flex justify-between items-center">
          <IonInput
            type={type}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            maxlength={maxLength}
            onIonInput={(e) => onInput?.(e.detail.value!)}
            onIonFocus={handleFocus}
            onIonBlur={handleBlur}
            className={textClasses}
            style={{
              "--background": "transparent",
              "--padding-start": "0",
              "--padding-end": "0",
              "--padding-top": "0",
              "--padding-bottom": "0",
              "--border-width": "0",
              "--box-shadow": "none",
              "--highlight-height": "0",
            }}
          />
        </div>
      </div>

      {hasError && (
        <span className="text-error text-sm font-normal font-sans leading-4">
          {error}
        </span>
      )}
    </div>
  );
};
