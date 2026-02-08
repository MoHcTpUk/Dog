import React, { useRef, useCallback } from "react";
import { IonModal } from "@ionic/react";

export interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const startYRef = useRef(0);
  const translateYRef = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    translateYRef.current = 0;
    if (contentRef.current) {
      contentRef.current.style.transition = "none";
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startYRef.current;
    translateYRef.current = Math.max(0, deltaY);
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${translateYRef.current}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transition = "transform 0.3s ease-out";
      if (translateYRef.current > 80) {
        contentRef.current.style.transform = `translateY(100%)`;
        setTimeout(onClose, 200);
      } else {
        contentRef.current.style.transform = "translateY(0)";
      }
    }
    translateYRef.current = 0;
  }, [onClose]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      backdropDismiss={true}
      handle={false}
      canDismiss={true}
      className="bottom-drawer"
      style={
        {
          "--background": "transparent",
        } as React.CSSProperties
      }
    >
      <div
        ref={contentRef}
        className="w-full h-full max-h-[85vh] flex flex-col bg-zinc-100 rounded-t-[20px]"
      >
        <div
          className="w-full flex items-center justify-center py-3 shrink-0 cursor-grab"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1 bg-zinc-300 rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <div className="flex flex-col gap-10">{children}</div>
        </div>
      </div>
    </IonModal>
  );
};
