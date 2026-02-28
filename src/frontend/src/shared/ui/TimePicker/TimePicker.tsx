import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { usePlatform } from "@shared/hooks/usePlatform";

export interface TimePickerValue {
  dayOffset: number;
  hour: number;
  minute: number;
}

export interface TimePickerProps {
  value: TimePickerValue;
  onChange: (value: TimePickerValue) => void;
  daysCount?: number;
  className?: string;
  syncToken?: number;
}

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
const TOP_PADDING = (PICKER_HEIGHT - ITEM_HEIGHT) / 2;
const BOTTOM_PADDING = PICKER_HEIGHT - ITEM_HEIGHT - TOP_PADDING;
const SCROLL_SETTLE_MS = 140;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 6 }, (_, i) => i * 10);
type TimeColumnType = "day" | "hour" | "minute";
type ColumnRefs = Record<TimeColumnType, HTMLDivElement | null>;
type TimeoutRefs = Record<TimeColumnType, number | null>;
type ActiveIndices = Record<TimeColumnType, number>;

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  daysCount = 30,
  className = "",
  syncToken = 0,
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
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        const weekday = date.toLocaleDateString("ru-RU", { weekday: "short" });
        const day = date.getDate();
        const month = date.toLocaleDateString("ru-RU", { month: "short" });
        result.push(`${weekday} ${day} ${month}`);
      }
    }

    return result;
  }, [daysCount, t]);

  const scrollRefs = useRef<ColumnRefs>({ day: null, hour: null, minute: null });
  const timeoutRefs = useRef<TimeoutRefs>({ day: null, hour: null, minute: null });
  const isInteractingRef = useRef<Record<TimeColumnType, boolean>>({
    day: false,
    hour: false,
    minute: false,
  });
  const syncLockUntilRef = useRef<Record<TimeColumnType, number>>({
    day: 0,
    hour: 0,
    minute: 0,
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  const getValueIndex = useCallback(
    (type: TimeColumnType, source = valueRef.current) => {
      if (type === "day") {
        return Math.max(0, Math.min(days.length - 1, source.dayOffset));
      }

      if (type === "hour") {
        return Math.max(0, HOURS.indexOf(source.hour));
      }

      const minuteIndex = MINUTES.indexOf(source.minute);
      return minuteIndex === -1 ? 0 : minuteIndex;
    },
    [days.length],
  );

  const [activeIndices, setActiveIndices] = useState<ActiveIndices>(() => ({
    day: getValueIndex("day", value),
    hour: getValueIndex("hour", value),
    minute: getValueIndex("minute", value),
  }));

  const setActiveIndex = useCallback((type: TimeColumnType, index: number) => {
    setActiveIndices((prev) =>
      prev[type] === index ? prev : { ...prev, [type]: index },
    );
  }, []);

  const getNearestIndex = useCallback(
    (type: TimeColumnType, scrollTop: number) => {
      const maxIndex =
        type === "day" ? days.length - 1 : type === "hour" ? HOURS.length - 1 : MINUTES.length - 1;

      return Math.max(0, Math.min(maxIndex, Math.round(scrollTop / ITEM_HEIGHT)));
    },
    [days.length],
  );

  const scrollToIndex = useCallback(
    (type: TimeColumnType, index: number) => {
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
    (type: TimeColumnType) => {
      const element = scrollRefs.current[type];
      if (!element) return;

      const current = valueRef.current;
      const index = getNearestIndex(type, element.scrollTop);
      const nextValue = { ...current };

      if (type === "day") {
        nextValue.dayOffset = index;
      } else if (type === "hour") {
        nextValue.hour = HOURS[index];
      } else {
        nextValue.minute = MINUTES[index];
      }

      scrollToIndex(type, index);

      if (
        nextValue.dayOffset !== current.dayOffset ||
        nextValue.hour !== current.hour ||
        nextValue.minute !== current.minute
      ) {
        haptic?.selection();
        onChange(nextValue);
      }
    },
    [getNearestIndex, haptic, onChange, scrollToIndex],
  );

  const handleScroll = useCallback(
    (type: TimeColumnType) => {
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
    scrollToIndex("hour", getValueIndex("hour"));
    scrollToIndex("minute", getValueIndex("minute"));
  }, [
    getValueIndex,
    scrollToIndex,
    syncToken,
    value.dayOffset,
    value.hour,
    value.minute,
  ]);

  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;

    return () => {
      (["day", "hour", "minute"] as const).forEach((type) => {
        if (currentTimeouts[type]) {
          window.clearTimeout(currentTimeouts[type]!);
          currentTimeouts[type] = null;
        }
      });
    };
  }, []);

  const beginInteraction = useCallback((type: TimeColumnType) => {
    isInteractingRef.current[type] = true;
  }, []);

  const endInteraction = useCallback((type: TimeColumnType) => {
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
      hour: (element: HTMLDivElement | null) => {
        scrollRefs.current.hour = element;
        if (!element) return;

        const index = getValueIndex("hour");
        const targetScrollTop = index * ITEM_HEIGHT;
        syncLockUntilRef.current.hour = Date.now() + 120;
        if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
          element.scrollTop = targetScrollTop;
        }
        setActiveIndex("hour", index);
      },
      minute: (element: HTMLDivElement | null) => {
        scrollRefs.current.minute = element;
        if (!element) return;

        const index = getValueIndex("minute");
        const targetScrollTop = index * ITEM_HEIGHT;
        syncLockUntilRef.current.minute = Date.now() + 120;
        if (Math.abs(element.scrollTop - targetScrollTop) > 1) {
          element.scrollTop = targetScrollTop;
        }
        setActiveIndex("minute", index);
      },
    }),
    [getValueIndex, setActiveIndex],
  );

  const renderColumn = (
    type: TimeColumnType,
    items: (string | number)[],
    formatItem?: (item: string | number) => string,
  ) => (
    <div className="flex-1 relative h-44 overflow-hidden">
      <div
        ref={columnRefs[type]}
        className="h-full overflow-y-auto scrollbar-hide relative z-10"
        style={{
          scrollSnapType: "y mandatory",
          scrollPaddingTop: TOP_PADDING,
          scrollPaddingBottom: BOTTOM_PADDING,
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
        <div style={{ height: TOP_PADDING }} />
        {items.map((item, index) => {
          const display = formatItem ? formatItem(item) : String(item);
          const isActive = activeIndices[type] === index;

          return (
            <div
              key={`${type}-${index}`}
              className="h-14 flex items-center justify-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <span
                className={`text-center text-base transition-all duration-75 font-['Golos_Text'] ${
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
        <div style={{ height: BOTTOM_PADDING }} />
      </div>
    </div>
  );

  const padTwo = (item: string | number) =>
    String(typeof item === "number" ? item : Number(item)).padStart(2, "0");

  return (
    <div
      className={`w-full h-44 relative flex flex-col justify-start items-center overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-center w-full h-full relative">
        {renderColumn("day", days)}
        {renderColumn("hour", HOURS, padTwo)}
        {renderColumn("minute", MINUTES, padTwo)}
      </div>
      <div className="absolute top-1/2 left-0 right-0 h-14 -translate-y-1/2 bg-white rounded-2xl pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100 to-zinc-100/0 pointer-events-none z-30" />
      <div className="absolute bottom-0 left-0 w-full h-14 bg-gradient-to-b from-zinc-100/0 to-zinc-100 pointer-events-none z-30" />
    </div>
  );
};
