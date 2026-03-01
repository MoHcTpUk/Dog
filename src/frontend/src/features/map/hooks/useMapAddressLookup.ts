import { useCallback, useEffect, useState } from "react";
import { resolveWalkLocationLabel } from "../lib";
import { useAbortableMapRequest } from "./useAbortableMapRequest";

type MapCoordinates = [number, number];

export const useMapAddressLookup = ({ active }: { active: boolean }) => {
  const [center, setCenter] = useState<MapCoordinates | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const resetAddressLookup = useCallback(() => {
    setCenter(null);
    setAddress("");
    setIsLoadingAddress(false);
  }, []);

  const {
    runRequest: runAddressLookup,
    scheduleRequest: scheduleAddressLookup,
    cancelRequest,
  } = useAbortableMapRequest<string>({
    request: (coords, signal) => resolveWalkLocationLabel(coords, signal),
    onStart: () => {
      setIsLoadingAddress(true);
    },
    onSuccess: (nextAddress) => {
      setAddress(nextAddress);
    },
    onFinally: () => {
      setIsLoadingAddress(false);
    },
  });

  const cancelAddressLookup = useCallback(() => {
    cancelRequest();
    setIsLoadingAddress(false);
  }, [cancelRequest]);

  useEffect(() => {
    if (!active) {
      cancelAddressLookup();
      resetAddressLookup();
    }
  }, [active, cancelAddressLookup, resetAddressLookup]);

  return {
    center,
    setCenter,
    address,
    isLoadingAddress,
    resetAddressLookup,
    runAddressLookup,
    scheduleAddressLookup,
    cancelAddressLookup,
  };
};
