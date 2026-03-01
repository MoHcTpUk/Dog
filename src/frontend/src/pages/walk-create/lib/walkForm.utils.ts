import type { TFunction } from "i18next";
import type { TimePickerValue } from "@shared/ui/TimePicker";

const WALK_FORM_DATE_LOCALE = "ru-RU";

export const DEFAULT_WALK_LOCATION_COORDS: [number, number] = [37.6173, 55.7558];

export const getTimeValueFromWalkDate = (
  walkTime: Date | string,
): TimePickerValue => {
  const now = new Date();
  const walkDate = new Date(walkTime);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const walkDayStart = new Date(
    walkDate.getFullYear(),
    walkDate.getMonth(),
    walkDate.getDate(),
  );

  const dayOffset = Math.max(
    0,
    Math.round(
      (walkDayStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  return {
    dayOffset,
    hour: walkDate.getHours(),
    minute: Math.floor(walkDate.getMinutes() / 10) * 10,
  };
};

export const formatWalkFormDateTime = (
  timeValue: TimePickerValue,
  t: TFunction,
): string => {
  const dayLabel =
    timeValue.dayOffset === 0
      ? t("Today")
      : timeValue.dayOffset === 1
        ? t("Tomorrow")
        : (() => {
            const date = new Date();
            date.setDate(date.getDate() + timeValue.dayOffset);

            return date.toLocaleDateString(WALK_FORM_DATE_LOCALE, {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
          })();

  const hours = String(timeValue.hour).padStart(2, "0");
  const minutes = String(timeValue.minute).padStart(2, "0");

  return `${dayLabel}, ${hours}:${minutes}`;
};
