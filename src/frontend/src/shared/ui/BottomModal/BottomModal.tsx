import React, { useRef, useCallback } from "react";
import { IonModal } from "@ionic/react";
import { Text } from "../Text/Text";
import "./BottomModal.module.css";

export interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  showHandle?: boolean;
  className?: string;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  buttons,
  showHandle = true,
  className = "",
}) => {
  const modalRef = useRef<HTMLIonModalElement>(null);
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
      ref={modalRef}
      isOpen={isOpen}
      onDidDismiss={onClose}
      showBackdrop={true}
      backdropDismiss={true}
      handle={false}
      className={`bottom-modal ${className}`}
    >
      <div
        ref={contentRef}
        className="w-full px-5 pt-2.5 pb-10 bg-zinc-100 rounded-tl-2xl rounded-tr-2xl flex flex-col items-center gap-6"
        style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
      >
        <div className="self-stretch flex flex-col justify-start items-center gap-7">
          {showHandle && (
            <div
              className="w-full flex items-center justify-center py-1 cursor-grab"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg
                width="58"
                height="4"
                viewBox="0 0 58 4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0.5" width="57" height="4" rx="2" fill="#E4E5E9" />
              </svg>
            </div>
          )}

          <div className="Content self-stretch flex flex-col justify-start items-start gap-6">
            {title && (
              <div className="Top self-stretch inline-flex justify-start items-start gap-2.5">
                <div className="Text flex-1 inline-flex flex-col justify-start items-start gap-[5px]">
                  <Text variant="bold-24" className="self-stretch text-start">
                    {title}
                  </Text>
                </div>
              </div>
            )}

            {children}
          </div>
        </div>

        {buttons && (
          <div className="Buttons self-stretch inline-flex justify-center items-start gap-2.5">
            {buttons}
          </div>
        )}
      </div>
    </IonModal>
  );
};
