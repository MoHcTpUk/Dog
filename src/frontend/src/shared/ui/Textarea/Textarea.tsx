import React, { useState } from "react";
import classNames from "classnames";
import { IonTextarea } from "@ionic/react";
import { Text } from "@shared/ui/Text/Text";

export interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  showCharCount?: boolean;
  onInput?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  containerClassName?: string;
  disableWrapper?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value = "",
  disabled = false,
  required = false,
  error = false,
  errorMessage,
  helperText,
  maxLength,
  rows = 4,
  showCharCount = false,
  onInput,
  onBlur,
  onFocus,
  className,
  containerClassName,
  disableWrapper = false,
}) => {
  const [focused, setFocused] = useState(false);

  const hasValue = value !== "" && value !== undefined && value !== null;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  // Determine textarea state for styling
  const getTextareaClasses = () => {
    const baseClasses = [
      "font-normal",
      "font-['Golos_Text']",
      "w-full",
      "border-0",
      "outline-none",
      "resize-none",
      "text-base",
      "leading-5",
    ];

    // Only add default styles if wrapper is enabled
    if (!disableWrapper) {
      baseClasses.push(
        "bg-background",
        "rounded-input",
        "rounded-[16px]",
        "min-h-textarea"
      );

      // State-based styling
      if (error) {
        baseClasses.push(
          "outline",
          "outline-1",
          "outline-error",
          "text-text-primary"
        );
      } else if (focused) {
        baseClasses.push(
          "outline",
          "outline-1",
          "outline-primary",
          "text-text-primary"
        );
      } else if (required && !hasValue) {
        baseClasses.push(
          "outline",
          "outline-1",
          "outline-info",
          "text-text-muted"
        );
      } else if (hasValue) {
        baseClasses.push("text-text-primary");
      } else {
        baseClasses.push("text-text-muted");
      }
    } else {
      // Minimal styling for custom wrappers
      baseClasses.push("bg-transparent");
      if (hasValue) {
        baseClasses.push("text-gray-700");
      } else {
        baseClasses.push("text-text-muted");
      }
    }

    if (disabled) {
      baseClasses.push("opacity-50", "cursor-not-allowed");
    }

    return classNames(baseClasses, className);
  };


  // If wrapper is disabled, return just the textarea
  if (disableWrapper) {
    return (
      <IonTextarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxLength}
        rows={rows}
        onIonInput={(e) => onInput?.(e.detail.value!)}
        onIonFocus={handleFocus}
        onIonBlur={handleBlur}
        className={getTextareaClasses()}
        style={{
          fontSize: '16px',
          '--background': 'transparent',
          '--padding-start': '0',
          '--padding-end': '0',
          '--padding-top': '0',
          '--padding-bottom': '0',
          '--border-width': '0',
          '--border-radius': '0',
          '--box-shadow': 'none',
          '--transition': 'none',
          '--webkit-transition': 'none',
          '--moz-transition': 'none',
          '--ms-transition': 'none',
          transition: 'none',
          '--min-height': 'auto',
          '--inner-padding-top': '0',
          '--inner-padding-bottom': '0',
          touchAction: 'manipulation',
          WebkitUserSelect: 'text',
          userSelect: 'text'
        } as React.CSSProperties}
        fill="outline"
      />
    );
  }

  return (
    <div className={classNames("flex flex-col", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2 font-sans">
          {label}
          {required && <Text className="text-error ml-1">*</Text>}
        </label>
      )}

      <div
        className={classNames("flex flex-col", {
          "gap-1.5": error && errorMessage,
        })}
      >
        <div className="relative">
          <IonTextarea
            value={value}
            placeholder={focused ? "" : placeholder}
            disabled={disabled}
            maxlength={maxLength}
            rows={rows}
            onIonInput={(e) => onInput?.(e.detail.value!)}
            onIonFocus={handleFocus}
            onIonBlur={handleBlur}
            className={getTextareaClasses()}
            style={{
              fontSize: '16px',
              '--background': 'transparent',
              '--padding-start': '20px',
              '--padding-end': '20px',
              '--padding-top': '20px',
              '--padding-bottom': '20px',
              '--border-width': '0',
              '--border-radius': '0',
              '--box-shadow': 'none',
              '--transition': 'none',
              '--webkit-transition': 'none',
              '--moz-transition': 'none',
              '--ms-transition': 'none',
              transition: 'none',
              '--min-height': 'auto',
              '--inner-padding-top': '0',
              '--inner-padding-bottom': '0',
              touchAction: 'manipulation',
              WebkitUserSelect: 'text',
              userSelect: 'text'
            } as React.CSSProperties}
            fill="outline"
          />
        </div>

        {/* Error message */}
        {error && errorMessage && (
          <Text className="text-error font-normal text-error-text leading-[18px] font-sans">
            {errorMessage}
          </Text>
        )}
      </div>

      <div className="flex justify-between items-start mt-2">
        <div>
          {/* Helper text (only show if no error) */}
          {helperText && !error && (
            <Text className="text-sm text-text-muted font-normal font-sans">
              {helperText}
            </Text>
          )}
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <Text className="text-sm text-text-muted font-normal flex-shrink-0 ml-4 font-sans">
            {value.length}/{maxLength}
          </Text>
        )}
      </div>
    </div>
  );
};
