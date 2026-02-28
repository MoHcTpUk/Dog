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
const SCROLL_SETTLE_MS = 280;
const PROGRAMMATIC_SCROLL_LOCK_MS = 220;
const SNAP_DURATION_MS = 120;
const REPEATS = 21;
const CENTER_REPEAT = Math.floor(REPEATS / 2);
const DAY_ITEMS = Array.from({ length: 31 }, (_, i) => i + 1);
type DateColumnType = "day" | "month" | "year";
type DateColumnState = Record<DateColumnType, number>;
type ProgrammaticScrollState = Record<
  DateColumnType,
  { target: number | null; expiresAt: number }
>;

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
  const days = DAY_ITEMS;

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollTimeoutRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    month: null,
    year: null,
  });
  const snapAnimationRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    month: null,
    year: null,
  });
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
  const programmaticScrollRef = useRef<ProgrammaticScrollState>({
    day: { target: null, expiresAt: 0 },
    month: { target: null, expiresAt: 0 },
    year: { target: null, expiresAt: 0 },
  });
  const [activeIndices, setActiveIndices] = useState<DateColumnState>(() => {
    const initialDaysLen = DAY_ITEMS.length;
    const dayIdx = Math.max(
      0,
      Math.min(initialDaysLen - 1, Math.min(value.day, daysInSelectedMonth) - 1),
    );
    const monthIdx = value.month - 1;
    const yearIdx = Math.max(0, years.indexOf(value.year));
    return {
      day: CENTER_REPEAT * initialDaysLen + dayIdx,
      month: CENTER_REPEAT * 12 + monthIdx,
      year: yearIdx,
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

  const getRenderLength = useCallback(
    (type: DateColumnType) => {
      const baseLength = getItemsLength(type);
      return isInfinite(type) ? baseLength * REPEATS : baseLength;
    },
    [getItemsLength, isInfinite],
  );

  const getDisplayIndexFromScrollTop = useCallback(
    (type: DateColumnType, scrollTop: number) => {
      const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const maxIndex = Math.max(0, getRenderLength(type) - 1);
      return Math.max(0, Math.min(maxIndex, rawIndex));
    },
    [getRenderLength],
  );

  const syncActiveIndex = useCallback(
    (type: DateColumnType, scrollTop: number) => {
      const nextIndex = getDisplayIndexFromScrollTop(type, scrollTop);
      setActiveIndices((prev) =>
        prev[type] === nextIndex ? prev : { ...prev, [type]: nextIndex },
      );
    },
    [getDisplayIndexFromScrollTop],
  );

  const cancelSnapAnimation = useCallback((type: DateColumnType) => {
    const frameId = snapAnimationRefs.current[type];
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      snapAnimationRefs.current[type] = null;
    }
  }, []);

  const setProgrammaticScrollTop = useCallback(
    (
      type: DateColumnType,
      element: HTMLDivElement,
      nextScrollTop: number,
      options?: { smooth?: boolean },
    ) => {
      const isSmooth = options?.smooth === true;
      cancelSnapAnimation(type);

      if (isSmooth) {
        const startScrollTop = element.scrollTop;
        const distance = nextScrollTop - startScrollTop;

        if (Math.abs(distance) <= 1) {
          element.scrollTop = nextScrollTop;
          programmaticScrollRef.current[type] = { target: null, expiresAt: 0 };
          syncActiveIndex(type, nextScrollTop);
          return;
        }

        const startTime = performance.now();
        programmaticScrollRef.current[type] = {
          target: nextScrollTop,
          expiresAt: Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS + SNAP_DURATION_MS,
        };

        const animate = (timestamp: number) => {
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / SNAP_DURATION_MS);
          const eased = 1 - Math.pow(1 - progress, 3);
          const currentScrollTop = startScrollTop + distance * eased;

          element.scrollTop = currentScrollTop;
          syncActiveIndex(type, currentScrollTop);

          if (progress < 1) {
            snapAnimationRefs.current[type] = window.requestAnimationFrame(animate);
            return;
          }

          snapAnimationRefs.current[type] = null;
          element.scrollTop = nextScrollTop;
          syncActiveIndex(type, nextScrollTop);
        };

        snapAnimationRefs.current[type] = window.requestAnimationFrame(animate);
        return;
      }

      programmaticScrollRef.current[type] = {
        target: nextScrollTop,
        expiresAt: Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS,
      };

      element.scrollTop = nextScrollTop;
      requestAnimationFrame(() => {
        if (Math.abs(element.scrollTop - nextScrollTop) > 1) {
          element.scrollTop = nextScrollTop;
        }
      });

      syncActiveIndex(type, nextScrollTop);
    },
    [cancelSnapAnimation, syncActiveIndex],
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
      const currentValue = valueRef.current;
      const newValue = { ...currentValue };
      let nextScrollTop = globalIndex * ITEM_HEIGHT;

      if (type === "day") {
        const len = daysRef.current.length;
        const realIdx = isInfinite(type)
          ? ((globalIndex % len) + len) % len
          : Math.max(0, Math.min(len - 1, globalIndex));
        const rawDay = daysRef.current[realIdx];
        const maxDaysForCurrentMonth = getDaysInMonth(
          currentValue.month,
          currentValue.year,
        );
        const clampedDay = Math.min(rawDay, maxDaysForCurrentMonth);

        newValue.day = clampedDay;

        if (clampedDay !== rawDay) {
          nextScrollTop = getCenterScrollTop(type, clampedDay - 1);
        }
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

      if (Math.abs(rawScrollTop - nextScrollTop) > 1) {
        setProgrammaticScrollTop(type, element, nextScrollTop, { smooth: true });
      } else {
        syncActiveIndex(type, nextScrollTop);
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
      getCenterScrollTop,
      isInfinite,
      recenterIfNeeded,
      setProgrammaticScrollTop,
      syncActiveIndex,
    ],
  );

  const getTargetScrollTop = useCallback(
    (type: DateColumnType) => {
      let targetIndex = 0;

      switch (type) {
        case "day":
          targetIndex = Math.min(
            Math.max(Math.min(value.day, daysInSelectedMonth) - 1, 0),
            days.length - 1,
          );
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
      daysInSelectedMonth,
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
      const programmaticState = programmaticScrollRef.current[type];
      if (programmaticState.target !== null) {
        const isSettled =
          Math.abs(element.scrollTop - programmaticState.target) <= 1;

        if (isSettled) {
          syncActiveIndex(type, programmaticState.target);
          programmaticScrollRef.current[type] = { target: null, expiresAt: 0 };
          return;
        }

        if (Date.now() <= programmaticState.expiresAt) {
          syncActiveIndex(type, element.scrollTop);
          return;
        }

        programmaticScrollRef.current[type] = { target: null, expiresAt: 0 };
      }

      isUserScrollingRef.current[type] = true;
      syncActiveIndex(type, element.scrollTop);
      scheduleCommit(type, element);
    },
    [scheduleCommit, syncActiveIndex],
  );

  useEffect(() => {
    const timeoutRefs = scrollTimeoutRefs.current;
    const frameRefs = snapAnimationRefs.current;
    return () => {
      (["day", "month", "year"] as const).forEach((type) => {
        if (timeoutRefs[type]) {
          window.clearTimeout(timeoutRefs[type]!);
          timeoutRefs[type] = null;
        }
        if (frameRefs[type] !== null) {
          window.cancelAnimationFrame(frameRefs[type]!);
          frameRefs[type] = null;
        }
      });
    };
  }, []);

  useEffect(() => {
    const scrollToValue = (type: "day" | "month" | "year") => {
      const element = scrollRefs.current[type];
      if (
        !element ||
        isUserScrollingRef.current[type] ||
        programmaticScrollRef.current[type].target !== null
      ) {
        return;
      }
      const targetScrollTop = getTargetScrollTop(type);
      const currentScrollTop = element.scrollTop;
      if (Math.abs(currentScrollTop - targetScrollTop) > 1) {
        setProgrammaticScrollTop(type, element, targetScrollTop);
      } else {
        syncActiveIndex(type, targetScrollTop);
      }
    };

    scrollToValue("day");
    scrollToValue("month");
    scrollToValue("year");

  }, [
    daysInSelectedMonth,
    getTargetScrollTop,
    setProgrammaticScrollTop,
    syncActiveIndex,
    value.day,
    value.month,
    value.year,
  ]);

  const beginInteraction = useCallback((type: DateColumnType) => {
    isPointerDownRef.current[type] = true;
  }, []);

  const endInteraction = useCallback(
    (type: DateColumnType) => {
      isPointerDownRef.current[type] = false;
      const element = scrollRefs.current[type];
      if (element && isUserScrollingRef.current[type]) {
        scheduleCommit(type, element);
      }
    },
    [scheduleCommit],
  );

  const renderColumn = (
    type: DateColumnType,
    items: (string | number)[],
    width: string,
  ) => {
    const inf = isInfinite(type);
    const activeIndex = activeIndices[type];
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
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
            overflowAnchor: "none",
            touchAction: "pan-y",
          }}
          onPointerDown={() => beginInteraction(type)}
          onPointerUp={() => endInteraction(type)}
          onPointerCancel={() => endInteraction(type)}
          onTouchStart={() => beginInteraction(type)}
          onTouchEnd={() => endInteraction(type)}
          onTouchCancel={() => endInteraction(type)}
          onScroll={(e) => handleScroll(type, e.currentTarget)}
        >
          {leadingSpacerHeight > 0 && <div style={{ height: leadingSpacerHeight }} />}
          {renderItems.map((item, index) => {
            const isActivePosition = index === activeIndex;
            const isDisabledDay =
              type === "day" &&
              typeof item === "number" &&
              item > daysInSelectedMonth;
            return (
              <div
                key={`${type}-${index}`}
                className="h-14 flex items-center justify-center relative"
              >
                <span
                  className={`${width} text-center text-base transition-all duration-100 font-['Golos_Text'] ${
                    isDisabledDay
                      ? "text-text-muted opacity-25"
                      : isActivePosition
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
