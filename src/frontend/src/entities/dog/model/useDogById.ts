import { hasActiveSession } from "@shared/api/auth/session";
import { useGetDogsGet } from "@shared/api/generated";
import { mapDogDtoToProfile } from "./dog.mappers";
import type { DogProfile } from "./dog.types";

export const useDogById = (dogId?: string) => {
  const { data, isLoading, isError, isFetched } = useGetDogsGet<DogProfile | null>(
    dogId ? { Ids: [dogId] } : undefined,
    {
      query: {
        enabled: hasActiveSession() && Boolean(dogId),
        select: (response) => {
          const [dog] = response.items ?? [];
          return dog ? mapDogDtoToProfile(dog) : null;
        },
      },
    }
  );

  return {
    dog: data ?? null,
    isLoading,
    isError,
    isFetched,
  };
};
