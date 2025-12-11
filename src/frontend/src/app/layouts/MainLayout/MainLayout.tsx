import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import { MainFooter } from "@widgets/footer";

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">{children}</div>
          <div className="sticky bottom-0 left-0 right-0 z-50">
            <MainFooter />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
