import classNames from "classnames";
import { Text } from "../Text";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
}

export interface ToggleProps<T extends string = string> {
  options: [ToggleOption<T>, ToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Toggle = <T extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
  fullWidth = false,
  className,
}: ToggleProps<T>) => {
  const [leftOption, rightOption] = options;

  const containerClasses = classNames(
    "inline-flex",
    "p-[3px]",
    "bg-white/60",
    "rounded-full",
    "shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]",
    {
      "w-full": fullWidth,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  const optionClasses = (isActive: boolean) =>
    classNames(
      "px-7",
      "py-3.5",
      "rounded-full",
      "transition-all",
      "duration-200",
      "cursor-pointer",
      "flex",
      "items-center",
      "justify-center",
      {
        "bg-white": isActive,
        "bg-transparent": !isActive,
        "flex-1": fullWidth,
        "cursor-not-allowed": disabled,
      }
    );

  const handleClick = (optionValue: T) => {
    if (!disabled && optionValue !== value) {
      onChange(optionValue);
    }
  };

  return (
    <div className={containerClasses}>
      <div
        className={optionClasses(value === leftOption.value)}
        onClick={() => handleClick(leftOption.value)}
      >
        <Text variant="medium-16" className="text-gray-700">
          {leftOption.label}
        </Text>
      </div>
      <div
        className={optionClasses(value === rightOption.value)}
        onClick={() => handleClick(rightOption.value)}
      >
        <Text variant="medium-16" className="text-gray-700">
          {rightOption.label}
        </Text>
      </div>
    </div>
  );
};
