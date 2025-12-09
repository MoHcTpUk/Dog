import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export interface DatePickerProps {
  value: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
}

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const { i18n } = useTranslation();
  const isRussian = i18n.language === "ru";
  const months = isRussian ? MONTHS_RU : MONTHS_EN;

  const [isScrolling, setIsScrolling] = useState({
    day: false,
    month: false,
    year: false,
  });

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollTimeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>(
    {}
  );
  const isInitializedRef = useRef(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const baseDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const baseMonths = months;

  // Зацикливаем дни и месяцы (x3 для плавного infinite scroll)
  const days = [...baseDays, ...baseDays, ...baseDays];
  const displayMonths = [...baseMonths, ...baseMonths, ...baseMonths];

  const ITEM_HEIGHT = 56;

  const handleScroll = (
    type: "day" | "month" | "year",
    element: HTMLDivElement
  ) => {
    if (scrollTimeoutRefs.current[type]) {
      clearTimeout(scrollTimeoutRefs.current[type]!);
    }

    scrollTimeoutRefs.current[type] = setTimeout(() => {
      const scrollTop = element.scrollTop;
      const centerIndex = Math.round(scrollTop / ITEM_HEIGHT);

      const newValue = { ...value };

      switch (type) {
        case "day":
          newValue.day = (centerIndex % 31) + 1;
          break;
        case "month":
          newValue.month = (centerIndex % 12) + 1;
          break;
        case "year":
          newValue.year =
            years[Math.max(0, Math.min(years.length - 1, centerIndex))];
          break;
      }

      if (
        newValue.day !== value.day ||
        newValue.month !== value.month ||
        newValue.year !== value.year
      ) {
        onChange(newValue);
      }

      // Зацикливание после обновления значения
      if (type === "day" && (centerIndex < 31 || centerIndex >= 62)) {
        const normalizedIndex = ((centerIndex % 31) + 31) % 31;
        setTimeout(() => {
          element.scrollTo({
            top: (normalizedIndex + 31) * ITEM_HEIGHT,
            behavior: "auto",
          });
        }, 0);
      } else if (type === "month" && (centerIndex < 12 || centerIndex >= 24)) {
        const normalizedIndex = ((centerIndex % 12) + 12) % 12;
        setTimeout(() => {
          element.scrollTo({
            top: (normalizedIndex + 12) * ITEM_HEIGHT,
            behavior: "auto",
          });
        }, 0);
      }

      setIsScrolling((prev) => ({ ...prev, [type]: false }));
    }, 150);
  };

  useEffect(() => {
    const scrollToValue = (type: "day" | "month" | "year") => {
      const element = scrollRefs.current[type];
      if (!element || isScrolling[type]) return;

      let targetIndex = 0;

      switch (type) {
        case "day":
          // Позиционируем в средней секции (второй набор из трех)
          targetIndex = value.day - 1 + 31;
          break;
        case "month":
          // Позиционируем в средней секции (второй набор из трех)
          targetIndex = value.month - 1 + 12;
          break;
        case "year":
          targetIndex = years.indexOf(value.year);
          if (targetIndex === -1) targetIndex = 0;
          break;
      }

      const targetScrollTop = targetIndex * ITEM_HEIGHT;
      const currentScrollTop = element.scrollTop;

      if (Math.abs(currentScrollTop - targetScrollTop) > 2) {
        element.scrollTo({
          top: targetScrollTop,
          behavior: isInitializedRef.current ? "smooth" : "auto",
        });
      }
    };

    if (!isInitializedRef.current) {
      scrollToValue("day");
      scrollToValue("month");
      scrollToValue("year");
      isInitializedRef.current = true;
    } else {
      scrollToValue("day");
      scrollToValue("month");
      scrollToValue("year");
    }
  }, [value.day, value.month, value.year, years, isScrolling]);

  const renderColumn = (
    type: "day" | "month" | "year",
    items: (string | number)[],
    width: string
  ) => {
    const getCurrentValue = () => {
      switch (type) {
        case "day":
          return value.day;
        case "month":
          return value.month;
        case "year":
          return value.year;
      }
    };
    const currentValue = getCurrentValue();
    return (
      <div className="flex-1 relative h-72 overflow-hidden">
        <div
          ref={(el) => {
            scrollRefs.current[type] = el;
          }}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            scrollSnapType: "y mandatory",
            scrollBehavior: "smooth",
          }}
          onScroll={(e) => {
            setIsScrolling((prev) => ({ ...prev, [type]: true }));
            handleScroll(type, e.currentTarget);
          }}
        >
          <div className="h-28" />

          {items.map((item, index) => {
            let itemValue;
            if (type === "year") {
              itemValue = item;
            } else if (type === "day") {
              itemValue = (index % 31) + 1;
            } else {
              itemValue = (index % 12) + 1;
            }
            const isActive = itemValue === currentValue;

            return (
              <div
                key={`${type}-${item}`}
                className="h-14 flex items-center justify-center relative z-20"
                style={{ scrollSnapAlign: "center" }}
              >
                <span
                  className={`${width} text-center text-base font-medium font-['Golos_Text'] transition-colors ${
                    isActive ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {item}
                </span>
              </div>
            );
          })}

          <div className="h-28" />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full h-72 relative flex flex-col justify-start items-center overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center w-full h-full relative">
        {renderColumn("day", days, "w-7")}
        {renderColumn("month", displayMonths, "w-24")}
        {renderColumn("year", years, "w-12")}
      </div>

      <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-white rounded-2xl pointer-events-none z-10" />

      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100 to-zinc-100/0 pointer-events-none z-30" />
      <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
    </div>
  );
};
