import { useContext } from "react";
import { MapGLContext } from "./context";

export const useMapGL = () => useContext(MapGLContext);
