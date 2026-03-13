import { useGetDogsAllSpecies } from "@shared/api/generated";
import { mapEnumerationToDogSpecies } from "./dog.mappers";
import type { DogSpecies } from "./dog.types";

export const useDogSpecies = () => {
  const { data, isLoading, isError } = useGetDogsAllSpecies<DogSpecies[]>({
    query: {
      select: (response) =>
        (response.items ?? []).map(mapEnumerationToDogSpecies),
      staleTime: 5 * 60 * 1000,
    },
  });

  return {
    species: data ?? [],
    isLoading,
    isError,
  };
};
