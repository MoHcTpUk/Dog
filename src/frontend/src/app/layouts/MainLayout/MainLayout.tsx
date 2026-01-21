import React from "react";
import { IonPage, IonContent } from "@ionic/react";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding" style={{ paddingBottom: '84px' }}>
        {children}
      </IonContent>
    </IonPage>
  );
};
