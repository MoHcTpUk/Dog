import React from "react";
import { IonPage, IonContent } from "@ionic/react";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        {children}
        <div
          className="w-full pointer-events-none"
          style={{ height: "calc(84px + env(safe-area-inset-bottom, 0px))" }}
        />
      </IonContent>
    </IonPage>
  );
};
