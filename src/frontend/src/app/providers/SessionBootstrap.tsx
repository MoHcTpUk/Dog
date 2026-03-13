import { useEffect } from "react";
import { mapDogProfileToCurrentDog, useMyDogs } from "@entities/dog";
import type { DogProfile } from "@entities/dog";
import { useMyOwner } from "@entities/owner";
import { getAccessToken } from "@shared/api/auth/session";
import {
  type CurrentDogProfile,
  useAppStore,
} from "@shared/store/app.store";

const pickCurrentDog = (
  currentDog: CurrentDogProfile | null,
  dogs: DogProfile[]
): CurrentDogProfile | null => {
  if (!dogs.length) {
    return null;
  }

  const selectedDog = currentDog?.id
    ? dogs.find((dog) => dog.id === currentDog.id) ?? dogs[0]
    : dogs[0];

  return mapDogProfileToCurrentDog(selectedDog);
};

const isSameCurrentDog = (
  left: CurrentDogProfile | null,
  right: CurrentDogProfile | null
) =>
  left?.id === right?.id &&
  left?.name === right?.name &&
  left?.breed === right?.breed &&
  left?.avatar === right?.avatar;

export const SessionBootstrap = () => {
  const token = useAppStore((state) => state.token);
  const currentDog = useAppStore((state) => state.currentDog);
  const setToken = useAppStore((state) => state.setToken);
  const setInitializing = useAppStore((state) => state.setInitializing);
  const hydrateSession = useAppStore((state) => state.hydrateSession);

  const sessionToken = getAccessToken();
  const hasSession = Boolean(sessionToken);

  const { owner, isLoading: isOwnerLoading, isError: isOwnerError, isFetched: isOwnerFetched } =
    useMyOwner();
  const { dogs, isLoading: isDogsLoading, isError: isDogsError, isFetched: isDogsFetched } =
    useMyDogs();

  useEffect(() => {
    if (!hasSession) {
      hydrateSession({
        token: null,
        owner: null,
        currentDog: null,
        isOnboarded: false,
      });
      setInitializing(false);
      return;
    }

    if (sessionToken !== token) {
      setToken(sessionToken);
    }
  }, [
    hasSession,
    hydrateSession,
    sessionToken,
    setInitializing,
    setToken,
    token,
  ]);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    if (isOwnerLoading || isDogsLoading || !isOwnerFetched || !isDogsFetched) {
      return;
    }

    if (isOwnerError || isDogsError) {
      hydrateSession({
        owner: null,
        currentDog: null,
        isOnboarded: false,
      });
      setInitializing(false);
      return;
    }

    const nextCurrentDog = pickCurrentDog(currentDog, dogs);

    hydrateSession({
      owner,
      currentDog: isSameCurrentDog(currentDog, nextCurrentDog)
        ? currentDog
        : nextCurrentDog,
      isOnboarded: Boolean(owner && dogs.length > 0),
    });
    setInitializing(false);
  }, [
    currentDog,
    dogs,
    hasSession,
    hydrateSession,
    isDogsError,
    isDogsFetched,
    isDogsLoading,
    isOwnerError,
    isOwnerFetched,
    isOwnerLoading,
    owner,
    setInitializing,
  ]);

  return null;
};
