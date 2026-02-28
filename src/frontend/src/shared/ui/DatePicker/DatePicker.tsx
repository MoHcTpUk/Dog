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
const TOP_PICKER_HEIGHT = 176;
const CENTER_PICKER_HEIGHT = 288;
const SCROLL_SETTLE_MS = 220;
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
  const containerHeight = isTop ? TOP_PICKER_HEIGHT : CENTER_PICKER_HEIGHT;
  const leadingSpacerHeight = isTop
    ? 0
    : (containerHeight - ITEM_HEIGHT) / 2;
  const trailingSpacerHeight = containerHeight - ITEM_HEIGHT - leadingSpacerHeight;
  const { haptic } = usePlatform();

  const months = useMemo(() => getMonthsList().map((m) => m.label), []);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentYear - i),
    [currentYear],
  );

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
  const isPointerDownRef = useRef<{ [key: string]: boolean }>({
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

  const setProgrammaticScrollTop = useCallback(
    (
      type: DateColumnType,
      element: HTMLDivElement,
      nextScrollTop: number,
    ) => {
      isRecentering.current[type] = true;
      element.scrollTop = nextScrollTop;
      setScrollTops((prev) =>
        prev[type] === nextScrollTop ? prev : { ...prev, [type]: nextScrollTop },
      );
      requestAnimationFrame(() => {
        isRecentering.current[type] = false;
      });
    },
    [],
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
        setProgrammaticScrollTop(type, element, newScrollTop);
      }
    },
    [isInfinite, getItemsLength, setProgrammaticScrollTop],
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
        setProgrammaticScrollTop(type, element, snappedScrollTop);
      }
      setScrollTops((prev) =>
        prev[type] === snappedScrollTop
          ? prev
          : { ...prev, [type]: snappedScrollTop },
      );

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
    [
      months.length,
      years,
      haptic,
      onChange,
      isInfinite,
      recenterIfNeeded,
      setProgrammaticScrollTop,
    ],
  );

  const getTargetScrollTop = useCallback(
    (type: DateColumnType) => {
      let targetIndex = 0;

      switch (type) {
        case "day":
          targetIndex = days.indexOf(value.day);
          if (targetIndex === -1) {
            targetIndex = Math.min(Math.max(value.day - 1, 0), days.length - 1);
          }
          break;
        case "month":
          targetIndex = Math.max(0, Math.min(months.length - 1, value.month - 1));
          break;
        case "year":
          targetIndex = years.indexOf(value.year);
          if (targetIndex === -1) targetIndex = 0;
          break;
      }

      return isInfinite(type)
        ? getCenterScrollTop(type, targetIndex)
        : targetIndex * ITEM_HEIGHT;
    },
    [
      days,
      getCenterScrollTop,
      isInfinite,
      months.length,
      value.day,
      value.month,
      value.year,
      years,
    ],
  );

  const scheduleCommit = useCallback(
    (type: DateColumnType, element: HTMLDivElement, delay = SCROLL_SETTLE_MS) => {
      if (scrollTimeoutRefs.current[type]) {
        window.clearTimeout(scrollTimeoutRefs.current[type]!);
      }

      const commitWhenIdle = () => {
        if (isPointerDownRef.current[type]) {
          scrollTimeoutRefs.current[type] = window.setTimeout(commitWhenIdle, delay);
          return;
        }

        handleCommit(type, element);
        scrollTimeoutRefs.current[type] = null;
      };

      scrollTimeoutRefs.current[type] = window.setTimeout(commitWhenIdle, delay);
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
      const targetScrollTop = getTargetScrollTop(type);
      const currentScrollTop = element.scrollTop;
      if (Math.abs(currentScrollTop - targetScrollTop) > 1) {
        setProgrammaticScrollTop(type, element, targetScrollTop);
      } else {
        setScrollTops((prev) =>
          prev[type] === targetScrollTop
            ? prev
            : { ...prev, [type]: targetScrollTop },
        );
      }
    };

    scrollToValue("day");
    scrollToValue("month");
    scrollToValue("year");

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTargetScrollTop, value.day, value.month, value.year, daysInSelectedMonth]);

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
          onPointerDown={() => {
            isPointerDownRef.current[type] = true;
          }}
          onPointerUp={() => {
            isPointerDownRef.current[type] = false;
          }}
          onPointerCancel={() => {
            isPointerDownRef.current[type] = false;
          }}
          onScroll={(e) => handleScroll(type, e.currentTarget)}
        >
          {leadingSpacerHeight > 0 && <div style={{ height: leadingSpacerHeight }} />}
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
          {trailingSpacerHeight > 0 && (
            <div style={{ height: trailingSpacerHeight }} />
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
