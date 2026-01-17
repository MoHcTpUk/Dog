import React from 'react';
import classNames from 'classnames';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const containerClasses = classNames(
    'w-12 p-0.5 rounded-[19.32px] flex items-center justify-start transition-colors duration-300 cursor-pointer',
    {
      'bg-pink-300': checked,
      'bg-slate-200': !checked,
      'opacity-50 cursor-not-allowed': disabled,
    },
    className
  );

  const toggleClasses = classNames(
    'size-6 relative bg-white rounded-[19.32px] shadow-[0px_0.19753088057041168px_0.7901235222816467px_0px_rgba(60,83,135,0.09)] shadow-[0px_0.19753088057041168px_1.9753087759017944px_0.19753088057041168px_rgba(60,83,135,0.05)] transition-transform duration-300 ease-in-out',
    {
      'translate-x-[20px]': checked,
      'translate-x-0': !checked,
    }
  );

  return (
    <div className={containerClasses} onClick={handleToggle}>
      <div className={toggleClasses} />
    </div>
  );
};
