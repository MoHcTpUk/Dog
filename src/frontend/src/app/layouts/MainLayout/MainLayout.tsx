import React from "react";
import { IonPage, IonContent } from "@ionic/react";

export interface MainLayoutProps {
  children: React.ReactNode;
  withFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  withFooter = false,
}) => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        {children}
        {withFooter && (
          <div
            className="w-full pointer-events-none"
            style={{ height: "calc(84px + env(safe-area-inset-bottom, 0px))" }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};
