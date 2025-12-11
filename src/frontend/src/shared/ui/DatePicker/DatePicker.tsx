import React, { useState, useEffect, useRef } from "react";
import { getDaysInMonth, getMonthsList } from "@shared/utils/date.utils";
import { usePlatform } from "@shared/hooks/usePlatform";

export interface DatePickerProps {
  value: { day: number; month: number; year: number };
  onChange: (date: { day: number; month: number; year: number }) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const { haptic } = usePlatform();

  const months = getMonthsList().map((m) => m.label);

  const ITEM_HEIGHT = 56;
  const SCROLL_DEBOUNCE = 100;
  const MAX_VELOCITY_PX_PER_MS = 0.1;
  const FLING_TIME_MS = 80;
  const ANIMATION_DURATION_MS = 300;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [isScrolling, setIsScrolling] = useState({
    day: false,
    month: false,
    year: false,
  });

  const daysInSelectedMonth = getDaysInMonth(value.month, value.year);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);
  const displayMonths = months;

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollTimeoutRefs = useRef<{ [key: string]: number | null }>({
    day: null,
    month: null,
    year: null,
  });
  const isInitializedRef = useRef(false);

  const touchStartRef = useRef<{ y: number; t: number } | null>(null);
  const lastMoveRef = useRef<{ y: number; t: number } | null>(null);

  // helper: плавная прокрутка (анимация, с easing)
  const animateScrollTo = (
    el: HTMLDivElement,
    target: number,
    duration = ANIMATION_DURATION_MS
  ) => {
    const start = el.scrollTop;
    const delta = target - start;
    if (delta === 0 || duration <= 0) {
      el.scrollTop = target;
      return;
    }
    const startTime = performance.now();
    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      el.scrollTop = start + delta * easeOutQuad(progress);
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const handleCommit = (
    type: "day" | "month" | "year",
    _element: HTMLDivElement,
    centerIndex: number
  ) => {
    const newValue = { ...value };

    if (type === "day") {
      const idx = Math.max(0, Math.min(days.length - 1, centerIndex));
      newValue.day = days[idx];
    } else if (type === "month") {
      const monthIdx = Math.max(0, Math.min(displayMonths.length - 1, centerIndex));
      newValue.month = monthIdx + 1;
    } else {
      const yearIdx = Math.max(0, Math.min(years.length - 1, centerIndex));
      newValue.year = years[yearIdx];
    }

    const maxDaysInNewMonth = getDaysInMonth(newValue.month, newValue.year);
    if (newValue.day > maxDaysInNewMonth) {
      newValue.day = maxDaysInNewMonth;
    }

    if (
      newValue.day !== value.day ||
      newValue.month !== value.month ||
      newValue.year !== value.year
    ) {
      haptic?.selection();
      onChange(newValue);
    }

    setIsScrolling((prev) => ({ ...prev, [type]: false }));
  };

  const handleScroll = (
    type: "day" | "month" | "year",
    element: HTMLDivElement
  ) => {
    const scrollTop = element.scrollTop;
    const centerIndex = Math.round(scrollTop / ITEM_HEIGHT);

    if (scrollTimeoutRefs.current[type]) {
      window.clearTimeout(scrollTimeoutRefs.current[type]!);
    }
    scrollTimeoutRefs.current[type] = window.setTimeout(() => {
      handleCommit(type, element, centerIndex);
      scrollTimeoutRefs.current[type] = null;
    }, SCROLL_DEBOUNCE);
  };

  // touch handlers: track speed and on touchend — рассчитываем "окончательную" цель с clamp
  const onTouchStart = (
    type: "day" | "month" | "year",
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartRef.current = { y: e.touches[0].clientY, t: performance.now() };
    lastMoveRef.current = { y: e.touches[0].clientY, t: performance.now() };
    setIsScrolling((prev) => ({ ...prev, [type]: true }));
    if (scrollTimeoutRefs.current[type]) {
      window.clearTimeout(scrollTimeoutRefs.current[type]!);
      scrollTimeoutRefs.current[type] = null;
    }
  };

  const onTouchMove = (
    _type: "day" | "month" | "year",
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    lastMoveRef.current = { y: e.touches[0].clientY, t: performance.now() };
  };

  const onTouchEnd = (
    type: "day" | "month" | "year",
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    const el = e.currentTarget;
    const start = touchStartRef.current;
    const last = lastMoveRef.current;
    touchStartRef.current = null;
    lastMoveRef.current = null;

    const scrollTop = el.scrollTop;
    const centerIndexNow = Math.round(scrollTop / ITEM_HEIGHT);

    if (!start || !last) {
      // просто зачекинг позиции
      handleCommit(type, el, centerIndexNow);
      return;
    }
    const dy = start.y - last.y; // положительное — движение вверх (скрол вниз)
    const dt = Math.max(1, last.t - start.t); // ms
    const velocity = dy / dt; // px per ms

    // clamp velocity
    const clampedV = Math.max(
      -MAX_VELOCITY_PX_PER_MS,
      Math.min(MAX_VELOCITY_PX_PER_MS, velocity)
    );
    const flingDistance = clampedV * FLING_TIME_MS; // px
    let targetScrollTop = scrollTop + flingDistance;

    // snap targetScrollTop to nearest item center
    const targetIndex = Math.round(targetScrollTop / ITEM_HEIGHT);
    let finalIndex = targetIndex;

    if (type === "year") {
      finalIndex = Math.max(0, Math.min(years.length - 1, finalIndex));
      targetScrollTop = finalIndex * ITEM_HEIGHT;
    } else if (type === "month") {
      finalIndex = Math.max(0, Math.min(displayMonths.length - 1, finalIndex));
      targetScrollTop = finalIndex * ITEM_HEIGHT;
    } else {
      finalIndex = Math.max(0, Math.min(days.length - 1, finalIndex));
      targetScrollTop = finalIndex * ITEM_HEIGHT;
    }

    // анимируем к targetScrollTop с нашей скоростью (вместо нативной сильной инерции)
    animateScrollTo(el, targetScrollTop, ANIMATION_DURATION_MS);

    // и поставим дебаунс, чтобы после анимации вызвать commit
    if (scrollTimeoutRefs.current[type]) {
      window.clearTimeout(scrollTimeoutRefs.current[type]!);
    }
    scrollTimeoutRefs.current[type] = window.setTimeout(() => {
      const centerIndex = Math.round(el.scrollTop / ITEM_HEIGHT);
      handleCommit(type, el, centerIndex);
      scrollTimeoutRefs.current[type] = null;
    }, ANIMATION_DURATION_MS + 40); // чуть позже окончания анимации
  };

  useEffect(() => {
    const scrollToValue = (type: "day" | "month" | "year") => {
      const element = scrollRefs.current[type];
      if (!element || isScrolling[type]) return;
      let targetIndex = 0;
      switch (type) {
        case "day":
          targetIndex = days.indexOf(value.day);
          if (targetIndex === -1) targetIndex = Math.min(value.day - 1, days.length - 1);
          break;
        case "month":
          targetIndex = value.month - 1;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daysInSelectedMonth]);

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
            WebkitOverflowScrolling: "auto",
            overscrollBehavior: "contain",
          }}
          onScroll={(e) => {
            setIsScrolling((prev) => ({ ...prev, [type]: true }));
            handleScroll(type, e.currentTarget);
          }}
          onTouchStart={(e) => onTouchStart(type, e)}
          onTouchMove={(e) => onTouchMove(type, e)}
          onTouchEnd={(e) => onTouchEnd(type, e)}
        >
          <div className="h-28" />
          {items.map((item, index) => {
            let isActive = false;
            if (type === "month") {
              isActive = index === currentValue - 1;
            } else {
              isActive = +item === +currentValue;
            }
            return (
              <div
                key={`${type}-${index}-${item}`}
                className="h-14 flex items-center justify-center relative z-20"
                style={{ scrollSnapAlign: "center" }}
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
