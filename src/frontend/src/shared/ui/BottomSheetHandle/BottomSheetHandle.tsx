import React from "react";
import classNames from "classnames";

export interface BottomSheetHandleProps {
  className?: string;
}

export const BottomSheetHandle: React.FC<BottomSheetHandleProps> = ({
  className,
}) => {
  return (
    <div className={classNames("flex justify-center", className)}>
      <div className="w-14 h-1 bg-zinc-300 rounded-full" />
    </div>
  );
};
