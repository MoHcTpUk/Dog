import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IonPage, IonContent } from '@ionic/react';
import { Button, Icon, CenterModal, RadioButton, Text } from '@shared/ui';

const REPORT_ISSUES = [
  'No dogs allowed',
  "Place doesn't exist",
] as const;

type ReportIssue = typeof REPORT_ISSUES[number];

export const PlaceReportPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [selectedIssue, setSelectedIssue] = useState<ReportIssue | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBack = () => {
    history.goBack();
  };

  const handleSubmit = () => {
    if (!selectedIssue) return;
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent style={{ '--background': 'var(--color-background-secondary)' } as React.CSSProperties}>
        <div className="flex flex-col gap-8 px-3 pt-5 pb-8">
          <div className="h-14 inline-flex items-center gap-3.5">
            <button
              className="p-2 bg-white rounded-full shadow-[0px_5px_9px_0px_rgba(66,58,58,0.06)]"
              onClick={handleBack}
            >
              <Icon name="arrow-left" size={24} color="var(--color-text-primary)" />
            </button>
            <Text variant="bold-24" color="primary" className="flex-1 leading-6">
              {t('Report an Error')}
            </Text>
          </div>

          <div className="flex flex-col gap-1">
            {REPORT_ISSUES.map((issue) => (
              <RadioButton
                key={issue}
                label={t(issue)}
                value={issue}
                checked={selectedIssue === issue}
                onChange={(val) => setSelectedIssue(val as ReportIssue)}
              />
            ))}
          </div>
        </div>
      </IonContent>

      <div className="px-3 pb-10 bg-background-secondary">
        <Button
          variant="primary"
          size="L"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedIssue}
        >
          {t('Report')}
        </Button>
      </div>

      <CenterModal isOpen={showSuccess} onClose={handleSuccessClose}>
        <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
          <div className="flex flex-col gap-2.5">
            <Text variant="bold-24" color="primary" className="leading-6">
              {t('Thank you!')}
            </Text>
            <Text variant="regular-14" color="muted" className="leading-4">
              {t('We will review the information')}
            </Text>
          </div>
          <Button variant="secondary-gray" size="M" fullWidth onClick={handleSuccessClose}>
            {t('Close')}
          </Button>
        </div>
      </CenterModal>
    </IonPage>
  );
};
