import { type ComponentType, FC } from "react";
import { IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect, useLocation, Switch } from "react-router-dom";
import { Location } from "history";
import { useMapGL } from "@features/map/context";
import { useSessionStore } from "@entities/session";

import { WelcomePage } from "@pages/welcome";
import { LoginPage } from "@pages/login";
import { RegistrationPage } from "@pages/registration";
import { OnboardingPage } from "@pages/onboarding";
import { CodeVerificationPage } from "@pages/verification";
import { HomePage } from "@pages/home";
import { MapPage } from "@pages/map";
import { DogProfilePage } from "@pages/dog-profile";
import { WalkDetailsPage } from "@pages/walk-details";
import { PlaceDetailsPage, PlaceReportPage } from "@pages/place-details";
import { PlaceSelectPage } from "@pages/place-create";
import { DogsPage } from "@pages/dogs";
import { WalkFormPage } from "@pages/walk-create";
import { ProfilePage, EditProfilePage, PromocodesPage, SettingsPage, FeedbackPage, TermsPage, LocationAccessPage, NotificationsPage } from "@pages/profile";
import { MainFooter } from "@widgets/footer";
import { PersistentMapLayer } from "@app/providers/PersistentMapLayer";
import { MapUIOverlay } from "@app/providers/MapUIOverlay";
import { WalkCreationOverlay } from "@app/providers/WalkCreationOverlay";
import { LocationPickerOverlay } from "@app/providers/LocationPickerOverlay";
import { PlaceCreationOverlay } from "@app/providers/PlaceCreationOverlay";

interface LocationState {
  background?: Location;
}

const AuthRoute: FC<{ exact?: boolean; path: string; component: FC }> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isOnboarded = useSessionStore((s) => s.isOnboarded);
  return (
    <Route
      {...rest}
      render={() => {
        if (isAuthenticated && isOnboarded) return <Redirect to="/home" />;
        if (isAuthenticated && !isOnboarded) return <Redirect to="/onboarding" />;
        return <Component />;
      }}
    />
  );
};

const OnboardingRoute: FC<{ exact?: boolean; path: string; component: FC }> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  return (
    <Route
      {...rest}
      render={() => {
        if (!isAuthenticated) return <Redirect to="/welcome" />;
        return <Component />;
      }}
    />
  );
};

const ProtectedRoute: FC<{
  exact?: boolean;
  path: string;
  component: ComponentType;
}> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isOnboarded = useSessionStore((s) => s.isOnboarded);
  return (
    <Route
      {...rest}
      render={() => {
        if (!isAuthenticated) return <Redirect to="/welcome" />;
        if (!isOnboarded) return <Redirect to="/onboarding" />;
        return <Component />;
      }}
    />
  );
};

const RootRedirect: FC = () => {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isOnboarded = useSessionStore((s) => s.isOnboarded);
  if (isAuthenticated && isOnboarded) return <Redirect to="/home" />;
  if (isAuthenticated) return <Redirect to="/onboarding" />;
  return <Redirect to="/welcome" />;
};

const AppContent: FC = () => {
  const location = useLocation<LocationState>();
  const background = location.state?.background;
  const { walkCreationActive, locationPickerActive, placeCreationActive } = useMapGL();

  const pagesWithFooter = ['/home', '/map', '/dog', '/profile'];
  const currentPath = background ? background.pathname : location.pathname;
  const showFooter = !walkCreationActive && !locationPickerActive && !placeCreationActive && pagesWithFooter.some(path => {
    if (path === '/dog') {
      return currentPath === '/dog';
    }
    return currentPath.startsWith(path);
  });

  return (
    <>
      <PersistentMapLayer />
      <MapUIOverlay />
      <WalkCreationOverlay />
      <LocationPickerOverlay />
      <PlaceCreationOverlay />
      <IonRouterOutlet animated={true}>
        <Switch location={background || location}>
          <AuthRoute exact path="/welcome" component={WelcomePage} />
          <AuthRoute exact path="/login" component={LoginPage} />
          <AuthRoute exact path="/registration" component={RegistrationPage} />
          <AuthRoute exact path="/verification" component={CodeVerificationPage} />
          <OnboardingRoute exact path="/onboarding" component={OnboardingPage} />
          <ProtectedRoute exact path="/home" component={HomePage} />
          <ProtectedRoute exact path="/map" component={MapPage} />
          <ProtectedRoute exact path="/walk/:id/edit" component={() => <WalkFormPage mode="edit" />} />
          <ProtectedRoute exact path="/place/create/select" component={PlaceSelectPage} />
          <ProtectedRoute exact path="/place/:id/report" component={PlaceReportPage} />
          <ProtectedRoute exact path="/dog" component={DogsPage} />
          <ProtectedRoute exact path="/dog/:id" component={DogProfilePage} />
          <ProtectedRoute exact path="/profile" component={ProfilePage} />
          <ProtectedRoute exact path="/profile/edit" component={EditProfilePage} />
          <ProtectedRoute exact path="/profile/promocodes" component={PromocodesPage} />
          <ProtectedRoute exact path="/profile/settings" component={SettingsPage} />
          <ProtectedRoute exact path="/profile/feedback" component={FeedbackPage} />
          <ProtectedRoute exact path="/profile/terms" component={TermsPage} />
          <ProtectedRoute exact path="/profile/location" component={LocationAccessPage} />
          <ProtectedRoute exact path="/notifications" component={NotificationsPage} />
          <Route exact path="/" component={RootRedirect} />
        </Switch>
      </IonRouterOutlet>

      {background && (
        <>
          <Route exact path="/walk/:id" component={WalkDetailsPage} />
          <Route exact path="/place/:id" component={PlaceDetailsPage} />
        </>
      )}

      {showFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <MainFooter />
        </div>
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
