import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getDaysInMonth, getMonthsList } from "@shared/utils/date.utils";
import { usePlatform } from "@shared/hooks/usePlatform";

export interface DatePickerProps {
  value: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
  variant?: "center" | "top";
  syncToken?: number;
}

const ITEM_HEIGHT = 56;
const TOP_PICKER_HEIGHT = 176;
const CENTER_PICKER_HEIGHT = 288;
const SCROLL_SETTLE_MS = 140;
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
type DateColumnType = "day" | "month" | "year";
type ColumnRefs = Record<DateColumnType, HTMLDivElement | null>;
type TimeoutRefs = Record<DateColumnType, number | null>;
type ActiveIndices = Record<DateColumnType, number>;

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
  variant = "center",
  syncToken = 0,
}) => {
  const isTop = variant === "top";
  const containerHeight = isTop ? TOP_PICKER_HEIGHT : CENTER_PICKER_HEIGHT;
  const topPadding = isTop ? 0 : (containerHeight - ITEM_HEIGHT) / 2;
  const bottomPadding = containerHeight - ITEM_HEIGHT - topPadding;
  const { haptic } = usePlatform();

  const months = useMemo(() => getMonthsList().map((month) => month.label), []);
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 100 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const maxValidDay = getDaysInMonth(value.month, value.year);

  const scrollRefs = useRef<ColumnRefs>({ day: null, month: null, year: null });
  const timeoutRefs = useRef<TimeoutRefs>({ day: null, month: null, year: null });
  const isInteractingRef = useRef<Record<DateColumnType, boolean>>({
    day: false,
    month: false,
    year: false,
  });
  const syncLockUntilRef = useRef<Record<DateColumnType, number>>({
    day: 0,
    month: 0,
    year: 0,
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  const getValueIndex = useCallback(
    (type: DateColumnType, source = valueRef.current) => {
      if (type === "day") {
        return Math.max(0, Math.min(DAYS.length - 1, Math.min(source.day, maxValidDay) - 1));
      }

      if (type === "month") {
        return Math.max(0, Math.min(months.length - 1, source.month - 1));
      }

      const yearIndex = years.indexOf(source.year);
      return yearIndex === -1 ? 0 : yearIndex;
    },
    [maxValidDay, months.length, years],
  );

  const [activeIndices, setActiveIndices] = useState<ActiveIndices>(() => ({
    day: getValueIndex("day", value),
    month: getValueIndex("month", value),
    year: getValueIndex("year", value),
  }));

  const setActiveIndex = useCallback((type: DateColumnType, index: number) => {
    setActiveIndices((prev) =>
      prev[type] === index ? prev : { ...prev, [type]: index },
    );
  }, []);

  const getNearestIndex = useCallback(
    (type: DateColumnType, scrollTop: number) => {
      const maxIndex =
        type === "day" ? DAYS.length - 1 : type === "month" ? months.length - 1 : years.length - 1;

      return Math.max(0, Math.min(maxIndex, Math.round(scrollTop / ITEM_HEIGHT)));
    },
    [months.length, years.length],
  );

  const scrollToIndex = useCallback(
    (type: DateColumnType, index: number) => {
      const element = scrollRefs.current[type];
      if (!element) return;

      const targetScrollTop = index * ITEM_HEIGHT;
      if (Math.abs(element.scrollTop - targetScrollTop) <= 1) {
        setActiveIndex(type, index);
        return;
      }

      syncLockUntilRef.current[type] = Date.now() + 120;
      element.scrollTop = targetScrollTop;
      setActiveIndex(type, index);
    },
    [setActiveIndex],
  );

  const commitColumn = useCallback(
    (type: DateColumnType) => {
      const element = scrollRefs.current[type];
      if (!element) return;

      const current = valueRef.current;
      const index = getNearestIndex(type, element.scrollTop);
      const nextValue = { ...current };

      if (type === "day") {
        nextValue.day = Math.min(DAYS[index], getDaysInMonth(current.month, current.year));
      } else if (type === "month") {
        nextValue.month = index + 1;
      } else {
        nextValue.year = years[index];
      }

      const normalizedMaxDay = getDaysInMonth(nextValue.month, nextValue.year);
      if (nextValue.day > normalizedMaxDay) {
        nextValue.day = normalizedMaxDay;
      }

      const targetIndex =
        type === "day"
          ? Math.max(0, nextValue.day - 1)
          : type === "month"
            ? nextValue.month - 1
            : Math.max(0, years.indexOf(nextValue.year));

      scrollToIndex(type, targetIndex);

      if (
        nextValue.day !== current.day ||
        nextValue.month !== current.month ||
        nextValue.year !== current.year
      ) {
        haptic?.selection();
        onChange(nextValue);
      }
    },
    [getNearestIndex, haptic, onChange, scrollToIndex, years],
  );

  const handleScroll = useCallback(
    (type: DateColumnType) => {
      if (Date.now() < syncLockUntilRef.current[type]) return;

      if (timeoutRefs.current[type]) {
        window.clearTimeout(timeoutRefs.current[type]!);
      }

      const schedule = () => {
        timeoutRefs.current[type] = window.setTimeout(() => {
          if (isInteractingRef.current[type]) {
            schedule();
            return;
          }

          timeoutRefs.current[type] = null;
          commitColumn(type);
        }, SCROLL_SETTLE_MS);
      };

      schedule();
    },
    [commitColumn],
  );

  useLayoutEffect(() => {
    scrollToIndex("day", getValueIndex("day"));
    scrollToIndex("month", getValueIndex("month"));
    scrollToIndex("year", getValueIndex("year"));
  }, [getValueIndex, scrollToIndex, syncToken, value.day, value.month, value.year]);

  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;

    return () => {
      (["day", "month", "year"] as const).forEach((type) => {
        if (currentTimeouts[type]) {
          window.clearTimeout(currentTimeouts[type]!);
          currentTimeouts[type] = null;
        }
      });
    };
  }, []);

  const beginInteraction = useCallback((type: DateColumnType) => {
    isInteractingRef.current[type] = true;
  }, []);

  const endInteraction = useCallback((type: DateColumnType) => {
    isInteractingRef.current[type] = false;
  }, []);

  const columnRefs = useMemo(
    () => ({
      day: (element: HTMLDivElement | null) => {
        scrollRefs.current.day = element;
        if (!element) return;

        const index = getValueIndex("day");
        const targetScrollTop = index * ITEM_HEIGHT;
        syncLockUntilRef.current.day = Date.now() + 120;
        if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
          element.scrollTop = targetScrollTop;
        }
        setActiveIndex("day", index);
      },
      month: (element: HTMLDivElement | null) => {
        scrollRefs.current.month = element;
        if (!element) return;

        const index = getValueIndex("month");
        const targetScrollTop = index * ITEM_HEIGHT;
        syncLockUntilRef.current.month = Date.now() + 120;
        if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
          element.scrollTop = targetScrollTop;
        }
        setActiveIndex("month", index);
      },
      year: (element: HTMLDivElement | null) => {
        scrollRefs.current.year = element;
        if (!element) return;

        const index = getValueIndex("year");
        const targetScrollTop = index * ITEM_HEIGHT;
        syncLockUntilRef.current.year = Date.now() + 120;
        if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
          element.scrollTop = targetScrollTop;
        }
        setActiveIndex("year", index);
      },
    }),
    [getValueIndex, setActiveIndex],
  );

  const renderColumn = (
    type: DateColumnType,
    items: (string | number)[],
    width: string,
  ) => (
    <div className={`flex-1 relative ${isTop ? "h-44" : "h-72"} overflow-hidden`}>
      <div
        ref={columnRefs[type]}
        className="h-full overflow-y-auto scrollbar-hide relative z-10"
        style={{
          scrollSnapType: "y mandatory",
          scrollPaddingTop: topPadding,
          scrollPaddingBottom: bottomPadding,
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
        onScroll={() => handleScroll(type)}
      >
        {topPadding > 0 && <div style={{ height: topPadding }} />}
        {items.map((item, index) => {
          const isDisabled =
            type === "day" && typeof item === "number" && item > maxValidDay;
          const isActive = activeIndices[type] === index;

          return (
            <div
              key={`${type}-${index}`}
              className="h-14 flex items-center justify-center"
              style={{ scrollSnapAlign: isTop ? "start" : "center" }}
            >
              <span
                className={`${width} text-center text-base transition-all duration-75 font-['Golos_Text'] ${
                  isDisabled
                    ? "text-text-muted opacity-30"
                    : isActive
                      ? "font-semibold text-text-primary"
                      : "text-text-muted"
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
        {bottomPadding > 0 && <div style={{ height: bottomPadding }} />}
      </div>
    </div>
  );

  return (
    <div
      className={`w-full ${
        isTop ? "h-44" : "h-72"
      } relative flex flex-col justify-start items-center overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center w-full h-full relative">
        {renderColumn("day", DAYS, "w-7")}
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
