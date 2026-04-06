import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customInstance } from "@shared/api/client";
import { getGetDogsGetQueryKey } from "@shared/api/generated";
import type { FileUploadResultType } from "@shared/api/generated/types";

const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const [header, base64] = dataUrl.split(",");
  const contentType = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const uint8Array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return new File([uint8Array], filename, { type: contentType });
};

const getPhotoFilename = (dataUrl: string) => {
  const ext = (dataUrl.match(/^data:image\/(\w+);/) ?? [])[1] ?? "jpg";
  return `photo.${ext}`;
};

export const uploadDogPhotoRequest = (
  dogId: string,
  dataUrl: string
): Promise<FileUploadResultType> => {
  const file = dataUrlToFile(dataUrl, getPhotoFilename(dataUrl));
  const formData = new FormData();

  // Backend endpoint expects [FromForm] IFormFile photo
  formData.append("photo", file, file.name);

  return customInstance<FileUploadResultType>({
    url: `/Dogs/${dogId}/AddPhoto`,
    method: "POST",
    data: formData,
  });
};

export const useUploadDogPhoto = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      dogId,
      dataUrl,
    }: {
      dogId: string;
      dataUrl: string;
    }) => uploadDogPhotoRequest(dogId, dataUrl),
  });

  const uploadPhoto = (dogId: string, dataUrl: string) =>
    mutateAsync({ dogId, dataUrl }).then(async (result) => {
      await queryClient.invalidateQueries({ queryKey: getGetDogsGetQueryKey() });
      return result;
    });

  return { uploadPhoto, isPending };
};
