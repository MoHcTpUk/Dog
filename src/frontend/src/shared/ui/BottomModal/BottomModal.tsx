import React, { useRef, useCallback } from "react";
import { IonModal } from "@ionic/react";
import { Text } from "../Text/Text";
import "./BottomModal.module.css";

export interface BottomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDidPresent?: () => void;
  keepContentsMounted?: boolean;
  title?: string;
  children: React.ReactNode;
  buttons?: React.ReactNode;
  showHandle?: boolean;
  className?: string;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  onClose,
  onDidPresent,
  keepContentsMounted = false,
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
      onDidPresent={onDidPresent}
      keepContentsMounted={keepContentsMounted}
      showBackdrop={true}
      backdropDismiss={true}
      handle={false}
      className={`bottom-modal ${className}`}
    >
      <div
        ref={contentRef}
        className="w-full max-h-[80vh] px-5 pt-2.5 pb-10 bg-zinc-100 rounded-tl-2xl rounded-tr-2xl flex flex-col items-center gap-6 overflow-hidden"
        style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
      >
        <div className="self-stretch min-h-0 flex flex-col justify-start items-center gap-7 flex-1">
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

          <div className="Content self-stretch min-h-0 flex flex-col justify-start items-start gap-6 flex-1">
            {title && (
              <div className="Top self-stretch inline-flex justify-start items-start gap-2.5">
                <div className="Text flex-1 inline-flex flex-col justify-start items-start gap-[5px]">
                  <Text variant="bold-24" className="self-stretch text-start">
                    {title}
                  </Text>
                </div>
              </div>
            )}

            <div className="self-stretch min-h-0 overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </div>
        </div>

        {buttons && (
          <div className="Buttons self-stretch inline-flex justify-center items-start gap-2.5 shrink-0">
            {buttons}
          </div>
        )}
      </div>
    </IonModal>
  );
};
