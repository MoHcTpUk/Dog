import React, { useState } from 'react';
import { Icon, Text } from '@shared/ui';

export interface PromoCodeCardProps {
  title: string;
  discount: string;
  validUntil: string;
  description: string;
  code: string;
}

export const PromoCodeCard: React.FC<PromoCodeCardProps> = ({
  title,
  discount,
  validUntil,
  description,
  code,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full p-5 bg-white rounded-3xl flex flex-col justify-center items-start gap-5">
      <div className="self-stretch inline-flex justify-start items-start gap-2.5">
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-[5px]">
          <div className="self-stretch inline-flex justify-between items-start">
            <Text variant="extra-bold-28" color="primary" className="leading-6">
              {title}
            </Text>
            <Text variant="extra-bold-28" color="primary" className="leading-6">
              {discount}
            </Text>
          </div>
          <Text variant="regular-14" color="muted" className="self-stretch h-4 leading-4">
            Действует до {validUntil}
          </Text>
        </div>
      </div>
      <Text variant="regular-14" color="primary" className="self-stretch leading-4">
        {description}
      </Text>
      <div
        className="self-stretch h-14 px-5 py-3.5 bg-zinc-100 rounded-2xl outline-dashed outline-1 outline-offset-[-1px] outline-slate-500 flex flex-col justify-center items-center gap-5 overflow-hidden cursor-pointer"
        onClick={handleCopy}
      >
        <div className="self-stretch inline-flex justify-start items-center gap-3.5">
          <Text variant="medium-16" color="primary" className="flex-1">
            {code}
          </Text>
          {isCopied ? (
            <Icon name="check-filled" size={24} color="#22C55E" />
          ) : (
            <Icon name="copy" size={24} />
          )}
        </div>
      </div>
    </div>
  );
};
