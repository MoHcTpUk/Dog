import { getFileUrl } from "@shared/api/files";
import type { FileUploadResultType } from "@shared/api/generated/types";

export interface DogPhotoEntry {
  photoId: string;
  source: string;
}

export const mapDogPhotoIdsToEntries = (photoIds: string[]): DogPhotoEntry[] =>
  photoIds
    .map((photoId) => {
      const source = getFileUrl(photoId);

      if (!source) {
        return null;
      }

      return {
        photoId,
        source,
      };
    })
    .filter((photo): photo is DogPhotoEntry => Boolean(photo));

interface SyncDogPhotosParams {
  dogId: string;
  nextSources: string[];
  existingPhotos: DogPhotoEntry[];
  uploadPhoto: (dogId: string, dataUrl: string) => Promise<FileUploadResultType>;
  removePhoto: (dogId: string, photoId: string) => Promise<unknown>;
}

export const syncDogPhotos = async ({
  dogId,
  nextSources,
  existingPhotos,
  uploadPhoto,
  removePhoto,
}: SyncDogPhotosParams): Promise<DogPhotoEntry[]> => {
  const normalizedSources = nextSources.filter(Boolean);
  const nextSourceSet = new Set(normalizedSources);
  const existingPhotosBySource = new Map(
    existingPhotos.map((photo) => [photo.source, photo])
  );

  for (const photo of existingPhotos) {
    if (!nextSourceSet.has(photo.source)) {
      await removePhoto(dogId, photo.photoId);
    }
  }

  const nextPhotos: DogPhotoEntry[] = [];

  for (const source of normalizedSources) {
    const existingPhoto = existingPhotosBySource.get(source);
    if (existingPhoto) {
      nextPhotos.push(existingPhoto);
      continue;
    }

    if (!source.startsWith("data:")) {
      nextPhotos.push({
        photoId: "",
        source,
      });
      continue;
    }

    const uploadedPhoto = await uploadPhoto(dogId, source);

    nextPhotos.push({
      photoId: uploadedPhoto.id,
      source: getFileUrl(uploadedPhoto.id) ?? source,
    });
  }

  return nextPhotos;
};
