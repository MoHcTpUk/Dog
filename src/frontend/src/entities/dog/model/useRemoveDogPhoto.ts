import { useDeleteDogsDogIdRemovePhotoPhotoId } from "@shared/api/generated";

export const useRemoveDogPhoto = () => {
  const { mutateAsync, isPending } = useDeleteDogsDogIdRemovePhotoPhotoId();

  const removePhoto = (dogId: string, photoId: string) =>
    mutateAsync({ dogId, photoId });

  return { removePhoto, isPending };
};
