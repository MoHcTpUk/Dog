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
const SCROLL_SETTLE_MS = 150;
type TimeColumnType = "day" | "hour" | "minute";

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
  const isInitializedRef = useRef(false);
  const isUserScrollingRef = useRef<{ [key: string]: boolean }>({
    day: false,
    hour: false,
    minute: false,
  });

  const [scrollTops, setScrollTops] = useState<{ [key: string]: number }>(() => {
    const minuteItems = Array.from({ length: 6 }, (_, i) => i * 10);
    const minuteIdx = Math.max(0, minuteItems.findIndex((m) => m === value.minute));
    return {
      day: value.dayOffset * ITEM_HEIGHT,
      hour: value.hour * ITEM_HEIGHT,
      minute: minuteIdx * ITEM_HEIGHT,
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
        element.scrollTo({
          top: snappedScrollTop,
          behavior: "smooth",
        });
      }
      setScrollTops((prev) => ({ ...prev, [type]: snappedScrollTop }));

      let newValue = { ...current };
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
    [getItems, hours, minutes, haptic, onChange],
  );

  const scheduleCommit = useCallback(
    (type: TimeColumnType, element: HTMLDivElement, delay = SCROLL_SETTLE_MS) => {
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
    (type: TimeColumnType, element: HTMLDivElement) => {
      isUserScrollingRef.current[type] = true;
      setScrollTops((prev) => ({ ...prev, [type]: element.scrollTop }));

      scheduleCommit(type, element);
    },
    [scheduleCommit],
  );

  const scrollToIndex = useCallback(
    (type: TimeColumnType, index: number, behavior: ScrollBehavior = "auto") => {
      const element = scrollRefs.current[type];
      if (!element) return;
      element.scrollTo({ top: index * ITEM_HEIGHT, behavior });
    },
    [],
  );

  const handleInteractionEnd = useCallback(
    (type: TimeColumnType, element: HTMLDivElement) => {
      scheduleCommit(type, element, 24);
    },
    [scheduleCommit],
  );

  useEffect(() => {
    if (!isInitializedRef.current) {
      const minuteIndex = minutes.findIndex((m) => m === value.minute);
      scrollToIndex("day", value.dayOffset);
      scrollToIndex("hour", value.hour);
      scrollToIndex("minute", minuteIndex >= 0 ? minuteIndex : 0);
      isInitializedRef.current = true;

      requestAnimationFrame(() => {
        const newTops: { [key: string]: number } = {};
        (["day", "hour", "minute"] as const).forEach((t) => {
          const el = scrollRefs.current[t];
          if (el) newTops[t] = el.scrollTop;
        });
        setScrollTops(newTops);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      (["day", "hour", "minute"] as const).forEach((type) => {
        if (scrollTimeoutRefs.current[type]) {
          window.clearTimeout(scrollTimeoutRefs.current[type]!);
          scrollTimeoutRefs.current[type] = null;
        }
      });
    };
  }, []);

  const renderColumn = (
    type: TimeColumnType,
    items: (string | number)[],
    formatItem?: (item: string | number) => string,
  ) => {
    const scrollTop = scrollTops[type] || 0;
    const activeIndex = Math.round(scrollTop / ITEM_HEIGHT);

    return (
      <div className="flex-1 relative h-44 overflow-hidden">
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
          <div style={{ height: ITEM_HEIGHT * 1.5 }} />
          {items.map((item, index) => {
            const isActive = index === activeIndex;
            const display = formatItem ? formatItem(item) : String(item);
            return (
              <div
                key={`${type}-${index}`}
                className="h-14 flex items-center justify-center"
                style={{ scrollSnapAlign: "center" }}
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
          <div style={{ height: ITEM_HEIGHT * 1.5 }} />
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
