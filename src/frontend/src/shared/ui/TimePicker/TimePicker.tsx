import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePlatform } from "@shared/hooks/usePlatform";

export interface TimePickerValue {
  dayOffset: number; // 0 = today, 1 = tomorrow, ...
  hour: number;
  minute: number;
}

export interface TimePickerProps {
  value: TimePickerValue;
  onChange: (value: TimePickerValue) => void;
  daysCount?: number;
  className?: string;
}

// Default initial time: current day, current hour + 10 minutes rounded up to next 10-min mark
export function getDefaultTimeValue(): TimePickerValue {
  const now = new Date();
  const rawNextMinute = now.getMinutes() + 10;
  const roundedMinute = Math.ceil(rawNextMinute / 10) * 10;
  const carryHours = Math.floor(roundedMinute / 60);
  const finalMinute = roundedMinute % 60;
  const rawNextHour = now.getHours() + carryHours;
  return {
    dayOffset: rawNextHour >= 24 ? 1 : 0,
    hour: rawNextHour % 24,
    minute: finalMinute,
  };
}

const ITEM_HEIGHT = 56;
const PICKER_HEIGHT = 176;
const SELECTION_OFFSET = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const TRAILING_SPACER_HEIGHT = PICKER_HEIGHT - ITEM_HEIGHT - SELECTION_OFFSET;
const SCROLL_SETTLE_MS = 280;
const PROGRAMMATIC_SCROLL_LOCK_MS = 220;
const SNAP_DURATION_MS = 120;
type TimeColumnType = "day" | "hour" | "minute";
type TimeColumnState = Record<TimeColumnType, number>;
type ProgrammaticScrollState = Record<
  TimeColumnType,
  { target: number | null; expiresAt: number }
>;

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  daysCount = 30,
  className = "",
}) => {
  const { t } = useTranslation();
  const { haptic } = usePlatform();

  const days = useMemo(() => {
    const result: string[] = [];
    const now = new Date();
    for (let i = 0; i < daysCount; i++) {
      if (i === 0) {
        result.push(t("Today"));
      } else if (i === 1) {
        result.push(t("Tomorrow"));
      } else {
        const d = new Date(now);
        d.setDate(now.getDate() + i);
        const dayName = d.toLocaleDateString("ru-RU", { weekday: "short" });
        const dayNum = d.getDate();
        const month = d.toLocaleDateString("ru-RU", { month: "short" });
        result.push(`${dayName} ${dayNum} ${month}`);
      }
    }
    return result;
  }, [daysCount, t]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(
    () => Array.from({ length: 6 }, (_, i) => i * 10),
    [],
  );

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollTimeoutRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    hour: null,
    minute: null,
  });
  const snapAnimationRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    hour: null,
    minute: null,
  });
  const isUserScrollingRef = useRef<{ [key: string]: boolean }>({
    day: false,
    hour: false,
    minute: false,
  });
  const isPointerDownRef = useRef<{ [key: string]: boolean }>({
    day: false,
    hour: false,
    minute: false,
  });
  const programmaticScrollRef = useRef<ProgrammaticScrollState>({
    day: { target: null, expiresAt: 0 },
    hour: { target: null, expiresAt: 0 },
    minute: { target: null, expiresAt: 0 },
  });

  const [activeIndices, setActiveIndices] = useState<TimeColumnState>(() => {
    const minuteItems = Array.from({ length: 6 }, (_, i) => i * 10);
    const minuteIdx = Math.max(0, minuteItems.findIndex((m) => m === value.minute));
    return {
      day: Math.max(0, value.dayOffset),
      hour: Math.max(0, value.hour),
      minute: minuteIdx,
    };
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const getItems = useCallback(
    (type: TimeColumnType) => {
      if (type === "day") return days;
      if (type === "hour") return hours;
      return minutes;
    },
    [days, hours, minutes],
  );

  const getDisplayIndexFromScrollTop = useCallback(
    (type: TimeColumnType, scrollTop: number) => {
      const items = getItems(type);
      const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
      const maxIndex = Math.max(0, items.length - 1);
      return Math.max(0, Math.min(maxIndex, rawIndex));
    },
    [getItems],
  );

  const syncActiveIndex = useCallback(
    (type: TimeColumnType, scrollTop: number) => {
      const nextIndex = getDisplayIndexFromScrollTop(type, scrollTop);
      setActiveIndices((prev) =>
        prev[type] === nextIndex ? prev : { ...prev, [type]: nextIndex },
      );
    },
    [getDisplayIndexFromScrollTop],
  );

  const cancelSnapAnimation = useCallback((type: TimeColumnType) => {
    const frameId = snapAnimationRefs.current[type];
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      snapAnimationRefs.current[type] = null;
    }
  }, []);

  const setProgrammaticScrollTop = useCallback(
    (
      type: TimeColumnType,
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

  const handleCommit = useCallback(
    (type: TimeColumnType, element: HTMLDivElement) => {
      const scrollTop = element.scrollTop;
      const items = getItems(type);
      const clampedIndex = Math.max(
        0,
        Math.min(items.length - 1, Math.round(scrollTop / ITEM_HEIGHT)),
      );
      const snappedScrollTop = clampedIndex * ITEM_HEIGHT;
      const current = valueRef.current;

      if (Math.abs(scrollTop - snappedScrollTop) > 1) {
        setProgrammaticScrollTop(type, element, snappedScrollTop, {
          smooth: true,
        });
      } else {
        syncActiveIndex(type, snappedScrollTop);
      }

      const newValue = { ...current };
      if (type === "day") newValue.dayOffset = clampedIndex;
      else if (type === "hour") newValue.hour = hours[clampedIndex];
      else newValue.minute = minutes[clampedIndex];

      if (
        newValue.dayOffset !== current.dayOffset ||
        newValue.hour !== current.hour ||
        newValue.minute !== current.minute
      ) {
        haptic?.selection();
        onChange(newValue);
      }
      isUserScrollingRef.current[type] = false;
    },
    [
      getItems,
      hours,
      minutes,
      haptic,
      onChange,
      setProgrammaticScrollTop,
      syncActiveIndex,
    ],
  );

  const getTargetScrollTop = useCallback(
    (type: TimeColumnType) => {
      if (type === "day") {
        return Math.max(0, Math.min(days.length - 1, value.dayOffset)) * ITEM_HEIGHT;
      }

      if (type === "hour") {
        const hourIndex = Math.max(0, hours.findIndex((hour) => hour === value.hour));
        return hourIndex * ITEM_HEIGHT;
      }

      const minuteIndex = Math.max(
        0,
        minutes.findIndex((minute) => minute === value.minute),
      );

      return minuteIndex * ITEM_HEIGHT;
    },
    [days.length, hours, minutes, value.dayOffset, value.hour, value.minute],
  );

  const scheduleCommit = useCallback(
    (type: TimeColumnType, element: HTMLDivElement, delay = SCROLL_SETTLE_MS) => {
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
    (type: TimeColumnType, element: HTMLDivElement) => {
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
    const syncColumn = (type: TimeColumnType) => {
      const element = scrollRefs.current[type];
      if (
        !element ||
        isUserScrollingRef.current[type] ||
        programmaticScrollRef.current[type].target !== null
      ) {
        return;
      }

      const targetScrollTop = getTargetScrollTop(type);

      if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
        setProgrammaticScrollTop(type, element, targetScrollTop);
      } else {
        syncActiveIndex(type, targetScrollTop);
      }
    };

    syncColumn("day");
    syncColumn("hour");
    syncColumn("minute");
  }, [
    getTargetScrollTop,
    setProgrammaticScrollTop,
    syncActiveIndex,
    value.dayOffset,
    value.hour,
    value.minute,
  ]);

  useEffect(() => {
    const timeoutRefs = scrollTimeoutRefs.current;
    const frameRefs = snapAnimationRefs.current;
    return () => {
      (["day", "hour", "minute"] as const).forEach((type) => {
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

  const beginInteraction = useCallback((type: TimeColumnType) => {
    isPointerDownRef.current[type] = true;
  }, []);

  const endInteraction = useCallback(
    (type: TimeColumnType) => {
      isPointerDownRef.current[type] = false;
      const element = scrollRefs.current[type];
      if (element && isUserScrollingRef.current[type]) {
        scheduleCommit(type, element);
      }
    },
    [scheduleCommit],
  );

  const renderColumn = (
    type: TimeColumnType,
    items: (string | number)[],
    formatItem?: (item: string | number) => string,
  ) => {
    const activeIndex = activeIndices[type];

    return (
      <div className="flex-1 relative h-44 overflow-hidden">
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
          <div style={{ height: SELECTION_OFFSET }} />
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const display = formatItem ? formatItem(item) : String(item);
            return (
              <div
                key={`${type}-${index}`}
                className="h-14 flex items-center justify-center"
              >
                <span
                  className={`text-center text-base transition-all duration-100 font-['Golos_Text'] ${
                    isActive
                      ? "font-semibold text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  {display}
                </span>
              </div>
            );
          })}
          <div style={{ height: TRAILING_SPACER_HEIGHT }} />
        </div>
      </div>
    );
  };

  const padTwo = (item: string | number) =>
    String(typeof item === "number" ? item : Number(item)).padStart(2, "0");

  return (
    <div
      className={`w-full h-44 relative flex flex-col justify-start items-center overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center w-full h-full relative">
        {renderColumn("day", days)}
        {renderColumn("hour", hours, padTwo)}
        {renderColumn("minute", minutes, padTwo)}
      </div>
      <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-white rounded-2xl pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100 to-zinc-100/0 pointer-events-none z-30" />
      <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
    </div>
  );
};
