import React, {
  useMemo,
} from "react";
import { MapGLContext } from "./context";
import { useMapCreationState } from "./useMapCreationState";
import { useMapDisplayState } from "./useMapDisplayState";
import { useMapRuntimeState } from "./useMapRuntimeState";

export const MapGLProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const runtimeState = useMapRuntimeState();
  const displayState = useMapDisplayState();
  const creationState = useMapCreationState();

  const contextValue = useMemo(
    () => ({
      ...runtimeState,
      ...displayState,
      ...creationState,
    }),
    [creationState, displayState, runtimeState],
  );

  return (
    <MapGLContext.Provider value={contextValue}>
      {children}
    </MapGLContext.Provider>
  );
};
