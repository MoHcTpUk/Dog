import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { getDaysInMonth, getMonthsList } from "@shared/utils/date.utils";
import { usePlatform } from "@shared/hooks/usePlatform";

export interface DatePickerProps {
  value: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
  variant?: "center" | "top";
}

const ITEM_HEIGHT = 56;
const SCROLL_SETTLE_MS = 150;
const REPEATS = 21;
const CENTER_REPEAT = Math.floor(REPEATS / 2);

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
  variant = "center",
}) => {
  const isTop = variant === "top";
  const { haptic } = usePlatform();

  const months = getMonthsList().map((m) => m.label);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const daysInSelectedMonth = getDaysInMonth(value.month, value.year);
  const days = useMemo(
    () => Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1),
    [daysInSelectedMonth],
  );

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollTimeoutRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    month: null,
    year: null,
  });
  const isInitializedRef = useRef(false);
  const isUserScrollingRef = useRef<{ [key: string]: boolean }>({
    day: false,
    month: false,
    year: false,
  });
  const isRecentering = useRef<{ [key: string]: boolean }>({
    day: false,
    month: false,
    year: false,
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const daysRef = useRef(days);
  daysRef.current = days;

  const isInfinite = useCallback(
    (type: "day" | "month" | "year") => type !== "year",
    [],
  );

  const getItemsLength = useCallback(
    (type: "day" | "month" | "year") => {
      if (type === "day") return daysRef.current.length;
      if (type === "month") return months.length;
      return years.length;
    },
    [months.length, years.length],
  );

  const getCenterScrollTop = useCallback(
    (type: "day" | "month" | "year", itemIndex: number) => {
      if (isInfinite(type)) {
        return (CENTER_REPEAT * getItemsLength(type) + itemIndex) * ITEM_HEIGHT;
      }
      return itemIndex * ITEM_HEIGHT;
    },
    [isInfinite, getItemsLength],
  );

  const recenterIfNeeded = useCallback(
    (type: "day" | "month" | "year", element: HTMLDivElement) => {
      if (!isInfinite(type)) return;
      const len = getItemsLength(type);
      const totalItems = len * REPEATS;
      const totalHeight = totalItems * ITEM_HEIGHT;
      const scrollTop = element.scrollTop;
      const oneSetHeight = len * ITEM_HEIGHT;
      const lowerBound = oneSetHeight * 2;
      const upperBound = totalHeight - oneSetHeight * 3;

      if (scrollTop < lowerBound || scrollTop > upperBound) {
        const currentIndex = Math.round(scrollTop / ITEM_HEIGHT);
        const realIndex = ((currentIndex % len) + len) % len;
        const newScrollTop = (CENTER_REPEAT * len + realIndex) * ITEM_HEIGHT;
        isRecentering.current[type] = true;
        element.scrollTop = newScrollTop;
        requestAnimationFrame(() => {
          isRecentering.current[type] = false;
        });
      }
    },
    [isInfinite, getItemsLength],
  );

  const handleCommit = useCallback(
    (type: "day" | "month" | "year", element: HTMLDivElement) => {
      recenterIfNeeded(type, element);

      const scrollTop = element.scrollTop;
      const globalIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const currentValue = valueRef.current;
      const currentDays = daysRef.current;
      const newValue = { ...currentValue };

      if (type === "day") {
        const len = currentDays.length;
        const realIdx = isInfinite(type)
          ? ((globalIndex % len) + len) % len
          : Math.max(0, Math.min(len - 1, globalIndex));
        newValue.day = currentDays[realIdx];
      } else if (type === "month") {
        const len = months.length;
        const realIdx = isInfinite(type)
          ? ((globalIndex % len) + len) % len
          : Math.max(0, Math.min(len - 1, globalIndex));
        newValue.month = realIdx + 1;
      } else {
        const yearIdx = Math.max(0, Math.min(years.length - 1, globalIndex));
        newValue.year = years[yearIdx];
      }

      const maxDaysInNewMonth = getDaysInMonth(newValue.month, newValue.year);
      if (newValue.day > maxDaysInNewMonth) {
        newValue.day = maxDaysInNewMonth;
      }

      if (
        newValue.day !== currentValue.day ||
        newValue.month !== currentValue.month ||
        newValue.year !== currentValue.year
      ) {
        haptic?.selection();
        onChange(newValue);
      }

      isUserScrollingRef.current[type] = false;
    },
    [months.length, years, haptic, onChange, isInfinite, recenterIfNeeded],
  );

  const handleScroll = useCallback(
    (type: "day" | "month" | "year", element: HTMLDivElement) => {
      if (isRecentering.current[type]) return;
      isUserScrollingRef.current[type] = true;

      if (scrollTimeoutRefs.current[type]) {
        window.clearTimeout(scrollTimeoutRefs.current[type]!);
      }
      scrollTimeoutRefs.current[type] = window.setTimeout(() => {
        handleCommit(type, element);
        scrollTimeoutRefs.current[type] = null;
      }, SCROLL_SETTLE_MS);
    },
    [handleCommit],
  );

  useEffect(() => {
    const scrollToValue = (type: "day" | "month" | "year") => {
      const element = scrollRefs.current[type];
      if (!element || isUserScrollingRef.current[type]) return;
      let targetIndex = 0;
      switch (type) {
        case "day":
          targetIndex = days.indexOf(value.day);
          if (targetIndex === -1)
            targetIndex = Math.min(value.day - 1, days.length - 1);
          break;
        case "month":
          targetIndex = value.month - 1;
          break;
        case "year":
          targetIndex = years.indexOf(value.year);
          if (targetIndex === -1) targetIndex = 0;
          break;
      }
      const targetScrollTop = isInfinite(type)
        ? getCenterScrollTop(type, targetIndex)
        : targetIndex * ITEM_HEIGHT;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInSelectedMonth]);

  const renderColumn = (
    type: "day" | "month" | "year",
    items: (string | number)[],
    width: string,
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
    const inf = isInfinite(type);
    const renderItems = inf
      ? Array.from(
          { length: items.length * REPEATS },
          (_, i) => items[i % items.length],
        )
      : items;

    return (
      <div
        className={`flex-1 relative ${isTop ? "h-44" : "h-72"} overflow-hidden`}
      >
        <div
          ref={(el) => {
            scrollRefs.current[type] = el;
          }}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            scrollSnapType: "y proximity",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
          onScroll={(e) => handleScroll(type, e.currentTarget)}
        >
          {!isTop && <div className="h-28" />}
          {renderItems.map((item, index) => {
            const realIndex = inf ? index % items.length : index;
            let isActive = false;
            if (type === "month") {
              isActive = realIndex === currentValue - 1;
            } else {
              isActive = +item === +currentValue;
            }
            return (
              <div
                key={`${type}-${index}`}
                className="h-14 flex items-center justify-center relative z-20"
                style={{ scrollSnapAlign: isTop ? "start" : "center" }}
              >
                <span
                  className={`${width} text-center text-base transition-all duration-100 font-['Golos_Text'] ${
                    isActive
                      ? "font-semibold text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  {item}
                </span>
              </div>
            );
          })}
          {isTop ? (
            <div style={{ height: 176 - ITEM_HEIGHT }} />
          ) : (
            <div className="h-28" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full ${
        isTop ? "h-44" : "h-72"
      } relative flex flex-col justify-start items-center overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center w-full h-full relative">
        {renderColumn("day", days, "w-7")}
        {renderColumn("month", months, "w-24")}
        {renderColumn("year", years, "w-12")}
      </div>
      {isTop ? (
        <>
          <div className="absolute top-0 left-0 right-0 h-14 bg-white rounded-2xl pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
        </>
      ) : (
        <>
          <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-white rounded-2xl pointer-events-none z-10" />
          <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100 to-zinc-100/0 pointer-events-none z-30" />
          <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
        </>
      )}
    </div>
  );
};
