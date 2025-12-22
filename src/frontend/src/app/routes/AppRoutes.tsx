import { FC, useMemo, useCallback } from "react";
import { IonRouterOutlet, useIonRouter } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, useLocation } from "react-router-dom";

import { WelcomePage } from "@pages/welcome";
import { LoginPage } from "@pages/login";
import { RegistrationPage } from "@pages/registration";
import { OnboardingPage } from "@pages/onboarding";
import { CodeVerificationPage } from "@pages/verification";
import { HomePage } from "@pages/home";
import { MapPage } from "@pages/map";
import { DogProfilePage } from "@pages/dog-profile";
import { WalkDetailsDrawer } from "@widgets/WalkDetailsDrawer";
import { mockWalks } from "@shared/mocks/walks.mock";

const AppContent: FC = () => {
  const router = useIonRouter();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const selectedWalkId = searchParams.get("walkId") || null;
  const selectedWalk = useMemo(
    () => selectedWalkId ? mockWalks.find((w) => w.id === selectedWalkId) || null : null,
    [selectedWalkId]
  );

  const handleCloseDrawer = useCallback(() => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("walkId");

    const newPath = location.pathname + (newSearchParams.toString() ? "?" + newSearchParams.toString() : "");
    router.push(newPath, "back", "pop");
  }, [location.search, location.pathname, router]);

  const handleDogClick = useCallback((dogId: string) => {
    router.push(`/dog/${dogId}`, "forward", "push");
  }, [router]);

  return (
    <>
      <IonRouterOutlet animated>
        <Route exact path="/welcome" component={WelcomePage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/registration" component={RegistrationPage} />
        <Route exact path="/onboarding" component={OnboardingPage} />
        <Route exact path="/verification" component={CodeVerificationPage} />
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/map" component={MapPage} />
        <Route exact path="/dog/:id" component={DogProfilePage} />
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      {/* Единая модалка на уровне всего приложения */}
      <WalkDetailsDrawer
        walk={selectedWalk}
        isOpen={!!selectedWalkId}
        onClose={handleCloseDrawer}
        onDogClick={handleDogClick}
      />
    </>
  );
};

export const AppRoutes: FC = () => {
  return (
    <IonReactRouter>
      <AppContent />
    </IonReactRouter>
  );
};
