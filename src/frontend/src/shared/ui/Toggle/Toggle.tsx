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
    "p-1",
    "bg-zinc-100",
    "rounded-[59px]",
    "gap-1",
    {
      "w-full": fullWidth,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  const optionClasses = (isActive: boolean) =>
    classNames(
      "px-6",
      "py-2.5",
      "rounded-[59px]",
      "transition-all",
      "duration-200",
      "cursor-pointer",
      "flex",
      "items-center",
      "justify-center",
      {
        "bg-white shadow-sm": isActive,
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
        <Text
          variant="medium-14"
          color={value === leftOption.value ? "primary" : "muted"}
        >
          {leftOption.label}
        </Text>
      </div>
      <div
        className={optionClasses(value === rightOption.value)}
        onClick={() => handleClick(rightOption.value)}
      >
        <Text
          variant="medium-14"
          color={value === rightOption.value ? "primary" : "muted"}
        >
          {rightOption.label}
        </Text>
      </div>
    </div>
  );
};
