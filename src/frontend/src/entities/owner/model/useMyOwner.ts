import { hasActiveSession } from "@shared/api/auth/session";
import { SESSION_QUERY_STALE_TIME } from "@shared/api/queryDefaults";
import { useGetOwnersGet } from "@shared/api/generated";
import { mapOwnerDtoToOwner } from "./owner.mappers";
import type { Owner } from "./owner.types";

interface UseMyOwnerOptions {
  enabled?: boolean;
}

export const useMyOwner = (options?: UseMyOwnerOptions) => {
  const { data, isLoading, isError, isFetched } = useGetOwnersGet<Owner | null>(
    undefined,
    {
      query: {
        enabled: hasActiveSession() && (options?.enabled ?? true),
        staleTime: SESSION_QUERY_STALE_TIME,
        select: (response) => {
          const [owner] = response.items ?? [];
          return owner ? mapOwnerDtoToOwner(owner) : null;
        },
      },
    }
  );

  return { owner: data ?? null, isLoading, isError, isFetched };
};
