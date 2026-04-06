import { useQueryClient } from "@tanstack/react-query";
import { useDeleteDogsDogIdRemovePhotoPhotoId } from "@shared/api/generated";
import { getGetDogsGetQueryKey } from "@shared/api/generated";

export const useRemoveDogPhoto = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useDeleteDogsDogIdRemovePhotoPhotoId();

  const removePhoto = (dogId: string, photoId: string) =>
    mutateAsync({ dogId, photoId }).then(async (result) => {
      await queryClient.invalidateQueries({ queryKey: getGetDogsGetQueryKey() });
      return result;
    });

  return { removePhoto, isPending };
};
