import { FC } from "react";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, useLocation, Switch } from "react-router-dom";
import { Location } from "history";

import { WelcomePage } from "@pages/welcome";
import { LoginPage } from "@pages/login";
import { RegistrationPage } from "@pages/registration";
import { OnboardingPage } from "@pages/onboarding";
import { CodeVerificationPage } from "@pages/verification";
import { HomePage } from "@pages/home";
import { MapPage } from "@pages/map";
import { DogProfilePage } from "@pages/dog-profile";
import { WalkDetailsPage } from "@pages/walk-details";
import { PlaceDetailsPage } from "@pages/place-details";
import { DogsPage } from "@pages/dogs";
import { ProfilePage, EditProfilePage, PromocodesPage, SettingsPage, FeedbackPage, TermsPage, LocationAccessPage, NotificationsPage } from "@pages/profile";

interface LocationState {
  background?: Location;
}

const AppContent: FC = () => {
  const location = useLocation<LocationState>();
  const background = location.state?.background;

  return (
    <>
      <IonRouterOutlet animated={true}>
        <Switch location={background || location}>
          <Route exact path="/welcome" component={WelcomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/registration" component={RegistrationPage} />
          <Route exact path="/onboarding" component={OnboardingPage} />
          <Route exact path="/verification" component={CodeVerificationPage} />
          <Route exact path="/home" component={HomePage} />
          <Route exact path="/map" component={MapPage} />
          <Route exact path="/dog" component={DogsPage} />
          <Route exact path="/dog/:id" component={DogProfilePage} />
          <Route exact path="/profile" component={ProfilePage} />
          <Route exact path="/profile/edit" component={EditProfilePage} />
          <Route exact path="/profile/promocodes" component={PromocodesPage} />
          <Route exact path="/profile/settings" component={SettingsPage} />
          <Route exact path="/profile/feedback" component={FeedbackPage} />
          <Route exact path="/profile/terms" component={TermsPage} />
          <Route exact path="/profile/location" component={LocationAccessPage} />
          <Route exact path="/notifications" component={NotificationsPage} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </Switch>
      </IonRouterOutlet>

      {background && (
        <>
          <Route exact path="/walk/:id" component={WalkDetailsPage} />
          <Route exact path="/place/:id" component={PlaceDetailsPage} />
        </>
      )}
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
