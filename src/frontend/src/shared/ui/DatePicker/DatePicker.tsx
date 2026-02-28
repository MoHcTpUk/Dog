import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
} from "react";
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
type DateColumnType = "day" | "month" | "year";

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
  const [scrollTops, setScrollTops] = useState<{ [key: string]: number }>(() => {
    const initialDaysLen = getDaysInMonth(value.month, value.year);
    const initialDays = Array.from({ length: initialDaysLen }, (_, i) => i + 1);
    const dayIdx = Math.max(0, initialDays.indexOf(value.day));
    const monthIdx = value.month - 1;
    const yearIdx = Math.max(0, years.indexOf(value.year));
    return {
      day: (CENTER_REPEAT * initialDaysLen + dayIdx) * ITEM_HEIGHT,
      month: (CENTER_REPEAT * 12 + monthIdx) * ITEM_HEIGHT,
      year: yearIdx * ITEM_HEIGHT,
    };
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const daysRef = useRef(days);
  daysRef.current = days;

  const isInfinite = useCallback((type: DateColumnType) => type !== "year", []);

  const getItemsLength = useCallback(
    (type: DateColumnType) => {
      if (type === "day") return daysRef.current.length;
      if (type === "month") return months.length;
      return years.length;
    },
    [months.length, years.length],
  );

  const getCenterScrollTop = useCallback(
    (type: DateColumnType, itemIndex: number) => {
      if (isInfinite(type)) {
        return (CENTER_REPEAT * getItemsLength(type) + itemIndex) * ITEM_HEIGHT;
      }
      return itemIndex * ITEM_HEIGHT;
    },
    [isInfinite, getItemsLength],
  );

  const recenterIfNeeded = useCallback(
    (type: DateColumnType, element: HTMLDivElement) => {
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
          setScrollTops((prev) => ({ ...prev, [type]: newScrollTop }));
        });
      }
    },
    [isInfinite, getItemsLength],
  );

  const handleCommit = useCallback(
    (type: DateColumnType, element: HTMLDivElement) => {
      recenterIfNeeded(type, element);

      const rawScrollTop = element.scrollTop;
      const globalIndex = Math.round(rawScrollTop / ITEM_HEIGHT);
      const snappedScrollTop = globalIndex * ITEM_HEIGHT;
      const currentValue = valueRef.current;
      const currentDays = daysRef.current;
      const newValue = { ...currentValue };

      if (Math.abs(rawScrollTop - snappedScrollTop) > 1) {
        element.scrollTo({
          top: snappedScrollTop,
          behavior: "smooth",
        });
      }
      setScrollTops((prev) => ({ ...prev, [type]: snappedScrollTop }));

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

  const scheduleCommit = useCallback(
    (type: DateColumnType, element: HTMLDivElement, delay = SCROLL_SETTLE_MS) => {
      if (scrollTimeoutRefs.current[type]) {
        window.clearTimeout(scrollTimeoutRefs.current[type]!);
      }

      scrollTimeoutRefs.current[type] = window.setTimeout(() => {
        handleCommit(type, element);
        scrollTimeoutRefs.current[type] = null;
      }, delay);
    },
    [handleCommit],
  );

  const handleScroll = useCallback(
    (type: DateColumnType, element: HTMLDivElement) => {
      if (isRecentering.current[type]) return;
      isUserScrollingRef.current[type] = true;

      setScrollTops((prev) => ({ ...prev, [type]: element.scrollTop }));

      scheduleCommit(type, element);
    },
    [scheduleCommit],
  );

  const handleInteractionEnd = useCallback(
    (type: DateColumnType, element: HTMLDivElement) => {
      scheduleCommit(type, element, 24);
    },
    [scheduleCommit],
  );

  useEffect(() => {
    return () => {
      (["day", "month", "year"] as const).forEach((type) => {
        if (scrollTimeoutRefs.current[type]) {
          window.clearTimeout(scrollTimeoutRefs.current[type]!);
          scrollTimeoutRefs.current[type] = null;
        }
      });
    };
  }, []);

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
          behavior: "auto",
        });
      }
    };

    if (!isInitializedRef.current) {
      scrollToValue("day");
      scrollToValue("month");
      scrollToValue("year");
      isInitializedRef.current = true;
      requestAnimationFrame(() => {
        const newTops: { [key: string]: number } = {};
        (["day", "month", "year"] as const).forEach((t) => {
          const el = scrollRefs.current[t];
          if (el) newTops[t] = el.scrollTop;
        });
        setScrollTops(newTops);
      });
    } else {
      scrollToValue("day");
      requestAnimationFrame(() => {
        const el = scrollRefs.current["day"];
        if (el) setScrollTops((prev) => ({ ...prev, day: el.scrollTop }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInSelectedMonth]);

  const renderColumn = (
    type: DateColumnType,
    items: (string | number)[],
    width: string,
  ) => {
    const inf = isInfinite(type);
    const scrollTop = scrollTops[type] || 0;
    const activeIndex = Math.round(scrollTop / ITEM_HEIGHT);
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
          className="h-full overflow-y-scroll scrollbar-hide relative z-10"
          style={{
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
          }}
          onScroll={(e) => handleScroll(type, e.currentTarget)}
          onTouchEnd={(e) => handleInteractionEnd(type, e.currentTarget)}
          onMouseUp={(e) => handleInteractionEnd(type, e.currentTarget)}
        >
          {!isTop && <div className="h-28" />}
          {renderItems.map((item, index) => {
            const isActivePosition = index === activeIndex;
            return (
              <div
                key={`${type}-${index}`}
                className="h-14 flex items-center justify-center relative"
                style={{ scrollSnapAlign: isTop ? "start" : "center" }}
              >
                <span
                  className={`${width} text-center text-base transition-all duration-100 font-['Golos_Text'] ${
                    isActivePosition
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
          <div className="absolute top-0 left-0 right-0 h-14 bg-white rounded-2xl pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
        </>
      ) : (
        <>
          <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-white rounded-2xl pointer-events-none z-0" />
          <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100 to-zinc-100/0 pointer-events-none z-30" />
          <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
        </>
      )}
    </div>
  );
};
