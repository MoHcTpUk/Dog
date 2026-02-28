import React from "react";

export interface CenterMapPinProps {
  top: string;
  left: string;
  pinRef: React.RefObject<HTMLDivElement | null>;
  shadowRef: React.RefObject<HTMLDivElement | null>;
  initialPinTransform: string;
  initialShadowTransform: string;
  initialShadowOpacity: number;
  body: React.ReactNode;
  shadow: React.ReactNode;
  zIndex?: number;
}

const PIN_TRANSITION = "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)";
const SHADOW_TRANSITION =
  "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease";

export const CenterMapPin: React.FC<CenterMapPinProps> = ({
  top,
  left,
  pinRef,
  shadowRef,
  initialPinTransform,
  initialShadowTransform,
  initialShadowOpacity,
  body,
  shadow,
  zIndex = 30,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        zIndex,
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", width: 0, height: 0 }}>
        <div
          ref={shadowRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: initialShadowTransform,
            opacity: initialShadowOpacity,
            transition: SHADOW_TRANSITION,
          }}
        >
          {shadow}
        </div>
        <div
          ref={pinRef}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: initialPinTransform,
            transition: PIN_TRANSITION,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
};
