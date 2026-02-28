import {
  format,
  formatDistance,
  isToday,
  isTomorrow,
  isThisWeek,
  parseISO,
} from "date-fns";
import { enUS, ru } from "date-fns/locale";
import i18n from "@i18n/config";

const locales = {
  en: enUS,
  ru: ru,
};

export const getLocale = (lang: string) =>
  locales[lang as keyof typeof locales] || enUS;

export const formatDate = (
  date: string | Date,
  pattern: string,
  lang = "en"
) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: getLocale(lang) });
};

export const formatActivityDate = (date: string | Date, lang = "en") => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "HH:mm")}`;
  }

  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "HH:mm")}`;
  }

  if (isThisWeek(dateObj)) {
    return format(dateObj, "EEEE, HH:mm", { locale: getLocale(lang) });
  }

  return format(dateObj, "MMM d, HH:mm", { locale: getLocale(lang) });
};

export const formatRelativeTime = (date: string | Date, lang = "en") => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: getLocale(lang),
  });
};

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

export interface DateParts {
  day: number;
  month: number;
  year: number;
}

interface ParseDatePartsOptions {
  fallback: DateParts;
  monthNames?: string[];
}

const normalizeDateParts = (date: DateParts, fallback: DateParts): DateParts => {
  const safeMonth = Number.isFinite(date.month) ? Math.trunc(date.month) : fallback.month;
  const normalizedMonth = Math.min(12, Math.max(1, safeMonth));
  const safeYear = Number.isFinite(date.year) ? Math.trunc(date.year) : fallback.year;
  const maxDay = getDaysInMonth(normalizedMonth, safeYear);
  const safeDay = Number.isFinite(date.day) ? Math.trunc(date.day) : fallback.day;

  return {
    day: Math.min(maxDay, Math.max(1, safeDay)),
    month: normalizedMonth,
    year: safeYear,
  };
};

export const parseDateParts = (
  value: string | Date | null | undefined,
  { fallback, monthNames = [] }: ParseDatePartsOptions,
): DateParts => {
  if (!value) {
    return normalizeDateParts(fallback, fallback);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return normalizeDateParts(
      {
        day: value.getDate(),
        month: value.getMonth() + 1,
        year: value.getFullYear(),
      },
      fallback,
    );
  }

  if (value instanceof Date) {
    return normalizeDateParts(fallback, fallback);
  }

  const rawValue = value.trim();
  if (!rawValue) {
    return normalizeDateParts(fallback, fallback);
  }

  const dotSeparatedMatch = rawValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotSeparatedMatch) {
    return normalizeDateParts(
      {
        day: Number(dotSeparatedMatch[1]),
        month: Number(dotSeparatedMatch[2]),
        year: Number(dotSeparatedMatch[3]),
      },
      fallback,
    );
  }

  const isoDateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T.*$)/);
  if (isoDateMatch) {
    return normalizeDateParts(
      {
        day: Number(isoDateMatch[3]),
        month: Number(isoDateMatch[2]),
        year: Number(isoDateMatch[1]),
      },
      fallback,
    );
  }

  if (monthNames.length > 0) {
    const normalizedMonthNames = monthNames.map((month) =>
      month.trim().toLowerCase(),
    );
    const textMonthMatch = rawValue
      .toLowerCase()
      .match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);

    if (textMonthMatch) {
      const monthIndex = normalizedMonthNames.findIndex(
        (month) => month === textMonthMatch[2],
      );

      if (monthIndex !== -1) {
        return normalizeDateParts(
          {
            day: Number(textMonthMatch[1]),
            month: monthIndex + 1,
            year: Number(textMonthMatch[3]),
          },
          fallback,
        );
      }
    }
  }

  const parsedDate = new Date(rawValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return normalizeDateParts(
      {
        day: parsedDate.getDate(),
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear(),
      },
      fallback,
    );
  }

  return normalizeDateParts(fallback, fallback);
};

export const MONTHS = () => ({
  "1": i18n.t("January"),
  "2": i18n.t("February"),
  "3": i18n.t("March"),
  "4": i18n.t("April"),
  "5": i18n.t("May"),
  "6": i18n.t("June"),
  "7": i18n.t("July"),
  "8": i18n.t("August"),
  "9": i18n.t("September"),
  "10": i18n.t("October"),
  "11": i18n.t("November"),
  "12": i18n.t("December"),
});

export const getMonthsList = () =>
  Object.keys(MONTHS()).map((key) => ({
    value: key,
    label: MONTHS()[key as keyof ReturnType<typeof MONTHS>],
  }));

export const getDateFilterOptions = () => ({
  today: {
    key: "today",
    label: "filter.date.today",
    value: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  tomorrow: {
    key: "tomorrow",
    label: "filter.date.tomorrow",
    value: () => {
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() + 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  weekend: {
    key: "weekend",
    label: "filter.date.weekend",
    value: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;

      const start = new Date();
      start.setDate(start.getDate() + daysUntilSaturday);
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(start.getDate() + 1);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    },
  },
  nextWeek: {
    key: "nextWeek",
    label: "filter.date.nextWeek",
    value: () => {
      const start = new Date();
      start.setDate(start.getDate() + 7);
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(end.getDate() + 13);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    },
  },
});
