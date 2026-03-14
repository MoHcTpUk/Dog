import { useEffect } from "react";
import { mapDogProfileToCurrentDog, useMyDogs } from "@entities/dog";
import type { DogProfile } from "@entities/dog";
import { useMyOwner } from "@entities/owner";
import { type CurrentDogProfile, useSessionStore } from "@entities/session";
import { getAccessToken } from "@shared/api/auth/session";

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
  const token = useSessionStore((state) => state.token);
  const ownerFromStore = useSessionStore((state) => state.owner);
  const currentDog = useSessionStore((state) => state.currentDog);
  const setToken = useSessionStore((state) => state.setToken);
  const setInitializing = useSessionStore((state) => state.setInitializing);
  const hydrateSession = useSessionStore((state) => state.hydrateSession);

  const sessionToken = getAccessToken();
  const hasSession = Boolean(sessionToken);
  const { dogs, isLoading: isDogsLoading, isError: isDogsError, isFetched: isDogsFetched } =
    useMyDogs();
  const {
    owner: fetchedOwner,
    isLoading: isOwnerLoading,
    isError: isOwnerError,
    isFetched: isOwnerFetched,
  } = useMyOwner();

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

    if (
      isDogsLoading ||
      !isDogsFetched ||
      isOwnerLoading ||
      !isOwnerFetched
    ) {
      return;
    }

    const resolvedOwner = fetchedOwner ?? ownerFromStore;

    if (isDogsError || isOwnerError) {
      hydrateSession({
        owner: resolvedOwner,
        currentDog: null,
        isOnboarded: false,
      });
      setInitializing(false);
      return;
    }

    const nextCurrentDog = pickCurrentDog(currentDog, dogs);
    const hasBoundDog = resolvedOwner?.id
      ? dogs.some((dog) => dog.ownerId === resolvedOwner.id)
      : false;

    hydrateSession({
      owner: resolvedOwner,
      currentDog: isSameCurrentDog(currentDog, nextCurrentDog)
        ? currentDog
        : nextCurrentDog,
      isOnboarded: Boolean(resolvedOwner?.id) && hasBoundDog,
    });
    setInitializing(false);
  }, [
    currentDog,
    dogs,
    fetchedOwner,
    hasSession,
    hydrateSession,
    isDogsError,
    isDogsFetched,
    isDogsLoading,
    isOwnerError,
    isOwnerFetched,
    isOwnerLoading,
    ownerFromStore,
    setInitializing,
  ]);

  return null;
};
