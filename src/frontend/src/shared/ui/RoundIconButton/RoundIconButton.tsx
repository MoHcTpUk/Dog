import React from "react";
import classNames from "classnames";
import { IonButton } from "@ionic/react";

export interface RoundIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  shadow?: boolean;
  rotateContent?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RoundIconButton: React.FC<RoundIconButtonProps> = ({
  children,
  onClick,
  type = "button",
  shadow = true,
  rotateContent = false,
  disabled = false,
  className,
}) => {
  return (
    <IonButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        "m-0 min-h-0 rounded-full bg-white inline-flex items-center justify-center",
        rotateContent && "-rotate-90",
        shadow && "shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]",
        className,
      )}
      style={
        {
          "--background": "transparent",
          "--background-activated": "transparent",
          "--background-focused": "transparent",
          "--background-hover": "transparent",
          "--color": "inherit",
          "--border-radius": "9999px",
          "--box-shadow": "none",
          "--ripple-color": "transparent",
          "--padding-start": "0",
          "--padding-end": "0",
          "--padding-top": "0",
          "--padding-bottom": "0",
          "--opacity": "1",
          height: "auto",
          minHeight: "0",
          contain: "none",
        } as React.CSSProperties
      }
      fill="clear"
    >
      <span className={classNames(rotateContent && "rotate-90")}>{children}</span>
    </IonButton>
  );
};
