import { hasActiveSession } from "@shared/api/auth/session";
import { SESSION_QUERY_STALE_TIME } from "@shared/api/queryDefaults";
import { useGetDogsGet } from "@shared/api/generated";
import { mapDogDtoToProfile } from "./dog.mappers";
import type { DogProfile } from "./dog.types";

export const useMyDogs = () => {
  const { data, isLoading, isError, isFetched } = useGetDogsGet<DogProfile[]>(
    undefined,
    {
      query: {
        enabled: hasActiveSession(),
        staleTime: SESSION_QUERY_STALE_TIME,
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
