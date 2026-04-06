import React, { useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useTranslation } from "react-i18next";
import { useIonRouter } from "@ionic/react";
import { Button, CodeInput, Text } from "@shared/ui";
import { BackIcon } from "@shared/ui/icons";
import { useResendTimer } from "@shared/hooks/useResendTimer";
import { useAuth } from "@features/auth";
import {
  clearPendingVerification,
  readPendingVerification,
  updatePendingVerificationCode,
  updatePendingVerificationRegistrationId,
} from "@features/auth/lib/pendingVerification";

// interface CodeVerificationPageProps {
//   email: string;
//   onSuccess?: () => void;
//   onResendCode?: () => void;
// }

export const CodeVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useIonRouter();
  const { verifyCode, sendVerificationCode, isLoading } = useAuth();
  const [codeError, setCodeError] = useState<string>("");
  const [pendingVerification, setPendingVerification] = useState(() =>
    readPendingVerification()
  );

  const { timeLeft, canResend, startTimer, formatTime } = useResendTimer(59);

  React.useEffect(() => {
    startTimer();
  }, [startTimer]);

  React.useEffect(() => {
    if (!pendingVerification) {
      router.push("/welcome", "back", "replace");
    }
  }, [pendingVerification, router]);

  const handleBack = () => {
    router.goBack();
  };

  const handleCodeComplete = async (code: string) => {
    setCodeError("");

    if (!pendingVerification?.registrationId) {
      setCodeError(t("Registration ID is missing. Please try again."));
      return;
    }

    try {
      await verifyCode(code, pendingVerification.registrationId);
      clearPendingVerification();
      router.push("/", "root", "replace");
    } catch {
      setCodeError(t("Invalid code. Please try again."));
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !pendingVerification?.email) {
      return;
    }

    setCodeError("");

    try {
      const response = await sendVerificationCode(pendingVerification.email);

      updatePendingVerificationRegistrationId(response.id);
      setPendingVerification((current) =>
        current
          ? {
              ...current,
              registrationId: response.id,
              verificationCode: response.verificationCode,
            }
          : current
      );
      updatePendingVerificationCode(response.verificationCode);
      startTimer();
    } catch {
      setCodeError(t("Failed to resend code. Please try again."));
    }
  };

  const handleCodeChange = () => {
    if (codeError) {
      setCodeError("");
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="min-h-full bg-[#F3F3F3] flex flex-col">
          <div
            className="flex-1 px-5 pt-5 pb-10 flex flex-col justify-between items-center"
            style={{ paddingTop: "67px" }}
          >
            <div className="self-stretch flex flex-col justify-start items-start gap-10">
              {/* Header with back button */}
              <div className="self-stretch h-14 inline-flex justify-start items-center gap-3.5">
                <BackIcon onClick={handleBack} />
              </div>

              {/* Title */}
              <Text
                variant="extra-bold-28"
                color="primary"
                tag="h1"
                className="self-stretch text-center text-gray-700 leading-relaxed"
              >
                {t("Check your email")}
              </Text>

              <div className="self-stretch flex flex-col justify-center items-center gap-3">
                {pendingVerification?.email ? (
                  <Text
                    variant="medium-14"
                    className="self-stretch text-center text-slate-500"
                  >
                    {pendingVerification.email}
                  </Text>
                ) : null}
                <CodeInput
                  length={4}
                  onComplete={handleCodeComplete}
                  onCodeChange={handleCodeChange}
                  hasError={!!codeError}
                  errorMessage={codeError}
                  className="self-stretch"
                />
                <Text
                  variant="medium-small-12"
                  className="text-slate-400 text-center"
                >
                  {t("Code")}:{" "}
                  <span className="font-mono font-bold">
                    {pendingVerification?.verificationCode || "..."}
                  </span>
                </Text>
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
              {canResend ? (
                <Button
                  variant="secondary-white"
                  size="M"
                  onClick={handleResendCode}
                  className="mx-auto"
                  disabled={isLoading}
                >
                  {isLoading ? t("Sending...") : t("New code")}
                </Button>
              ) : (
                <Text variant="medium-small-12" className="text-slate-500 leading-none self-stretch text-center">
                  {t("Get new code available in ")} {formatTime(timeLeft)}
                </Text>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
