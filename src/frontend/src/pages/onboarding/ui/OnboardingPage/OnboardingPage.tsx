import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { StepperIntroView, DogProfileStepper, VerificationView } from "@features/onboarding";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ScreenType = "stepper-intro" | "stepper" | "verification";

export const OnboardingPage: React.FC = () => {
  const history = useHistory();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('step') ? 'stepper' : 'stepper-intro';
  });
  const { t } = useTranslation();

  const showToastMessage = (message: string) => {
    console.log(message);
  };

  const handleVerificationComplete = () => {
    history.push("/home");
  };

  if (currentScreen === "stepper-intro") {
    return (
      <IonPage>
        <IonContent>
          <StepperIntroView
            onNext={() => setCurrentScreen("stepper")}
            onSkip={() => showToastMessage(t("Switching to limited functionality mode"))}
          />
        </IonContent>
      </IonPage>
    );
  }

  if (currentScreen === "verification") {
    return (
      <IonPage>
        <IonContent>
          <VerificationView
            onVerify={handleVerificationComplete}
            onSkip={handleVerificationComplete}
          />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent>
        <DogProfileStepper
          onComplete={() => setCurrentScreen("verification")}
          onBack={() => setCurrentScreen("stepper-intro")}
        />
      </IonContent>
    </IonPage>
  );
};
