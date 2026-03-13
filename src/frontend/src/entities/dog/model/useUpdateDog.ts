import { useQueryClient } from "@tanstack/react-query";
import { getGetDogsGetQueryKey, usePutDogsUpdate } from "@shared/api/generated";
import type { UpdateDogCommandType } from "@shared/api/generated/types";

export const useUpdateDog = () => {
  const queryClient = useQueryClient();
  const mutation = usePutDogsUpdate();

  const updateDog = async (payload: UpdateDogCommandType) => {
    const result = await mutation.mutateAsync({ data: payload });
    await queryClient.invalidateQueries({ queryKey: getGetDogsGetQueryKey() });
    return result;
  };

  return {
    updateDog,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
