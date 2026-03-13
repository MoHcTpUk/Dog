import { useQueryClient } from "@tanstack/react-query";
import {
  getGetOwnersGetQueryKey,
  usePutOwnersUpdate,
} from "@shared/api/generated";
import type { UpdateOwnerCommandType } from "@shared/api/generated/types";

export const useUpdateOwner = () => {
  const queryClient = useQueryClient();
  const mutation = usePutOwnersUpdate();

  const updateOwner = async (payload: UpdateOwnerCommandType) => {
    const result = await mutation.mutateAsync({ data: payload });
    await queryClient.invalidateQueries({ queryKey: getGetOwnersGetQueryKey() });
    return result;
  };

  return {
    updateOwner,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
