import type { OwnerDtoType } from "@shared/api/generated/types";
import type { Owner } from "./owner.types";

export const mapOwnerDtoToOwner = (owner: OwnerDtoType): Owner => ({
  id: owner.id ?? null,
  name: owner.name,
  birthdate: owner.birthdate ?? null,
});
