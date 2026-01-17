import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CenterModal.module.css';

export interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CenterModal: React.FC<CenterModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`${styles.overlay} ${isVisible ? styles.visible : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.content} ${isVisible ? styles.visible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
