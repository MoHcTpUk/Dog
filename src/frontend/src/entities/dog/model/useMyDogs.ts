import { hasActiveSession } from "@shared/api/auth/session";
import { useGetDogsGet } from "@shared/api/generated";
import { mapDogDtoToProfile } from "./dog.mappers";
import type { DogProfile } from "./dog.types";

export const useMyDogs = () => {
  const { data, isLoading, isError, isFetched } = useGetDogsGet<DogProfile[]>(
    undefined,
    {
      query: {
        enabled: hasActiveSession(),
        select: (response) => (response.items ?? []).map(mapDogDtoToProfile),
      },
    }
  );

  return {
    dogs: data ?? [],
    isLoading,
    isError,
    isFetched,
  };
};
