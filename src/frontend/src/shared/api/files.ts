import { resolveApiPath } from "./client";

export const getFileUrl = (fileId?: string | null) => {
  if (!fileId) {
    return null;
  }

  const searchParams = new URLSearchParams({ fileId });

  return resolveApiPath(`/GetFile?${searchParams.toString()}`);
};
