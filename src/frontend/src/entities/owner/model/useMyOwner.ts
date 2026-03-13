import { hasActiveSession } from "@shared/api/auth/session";
import { useGetOwnersGet } from "@shared/api/generated";
import { mapOwnerDtoToOwner } from "./owner.mappers";
import type { Owner } from "./owner.types";

export const useMyOwner = () => {
  const { data, isLoading, isError, isFetched } = useGetOwnersGet<Owner | null>(
    undefined,
    {
      query: {
        enabled: hasActiveSession(),
        select: (response) => {
          const [owner] = response.items ?? [];
          return owner ? mapOwnerDtoToOwner(owner) : null;
        },
      },
    }
  );

  return { owner: data ?? null, isLoading, isError, isFetched };
};
