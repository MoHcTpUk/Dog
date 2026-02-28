import React from 'react';
import { Icon, type IconName } from '../Icon';

export type ToastVariant = 'info' | 'error' | 'success';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  className?: string;
}

const variantConfig: Record<
  ToastVariant,
  {
    icon: IconName;
    iconColor: string;
    surfaceClassName: string;
  }
> = {
  info: {
    icon: 'exclamation',
    iconColor: '#8552FF',
    surfaceClassName: 'bg-violet-50 outline-purple-300',
  },
  error: {
    icon: 'cross-filled',
    iconColor: '#F43F5E',
    surfaceClassName: 'bg-rose-100 outline-pink-300',
  },
  success: {
    icon: 'check-filled',
    iconColor: '#23BA6E',
    surfaceClassName: 'bg-emerald-100 outline-emerald-200',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  className = '',
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={`pointer-events-none fixed top-[60px] left-1/2 z-[100] w-[calc(100vw-40px)] max-w-96 -translate-x-1/2 ${className}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <div
        className={`flex w-full items-center gap-3 rounded-2xl p-5 outline outline-1 -outline-offset-1 ${config.surfaceClassName}`}
      >
        <Icon
          name={config.icon}
          size={24}
          color={config.iconColor}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1 text-base leading-5 font-normal font-['Golos_Text'] text-zinc-700">
          {message}
        </div>
      </div>
    </div>
  );
};
