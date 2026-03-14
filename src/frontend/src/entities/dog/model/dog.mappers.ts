import type { DogDtoType, EnumerationDtoType } from "@shared/api/generated/types";
import { Activity, Gender } from "./dog.enums";
import type { DogProfile, DogSpecies } from "./dog.types";
import { isDogSpecies } from "./dog.types";

const normalizeGender = (value?: number): Gender => {
  if (value === Gender.Male || value === Gender.Female) {
    return value;
  }

  return Gender.Unknown;
};

const normalizeActivity = (value?: number): Activity | null => {
  if (
    value === Activity.Low ||
    value === Activity.Medium ||
    value === Activity.High
  ) {
    return value;
  }

  return null;
};

const normalizeSpecies = (
  species?: DogDtoType["species"] | EnumerationDtoType
): DogSpecies | null => {
  if (!species) {
    return null;
  }

  if (isDogSpecies(species)) {
    return species;
  }

  if (typeof species.value === "number" && typeof species.name === "string") {
    return {
      value: species.value,
      name: species.name,
    };
  }

  return null;
};

export const mapDogDtoToProfile = (dog: DogDtoType): DogProfile => ({
  id: dog.id ?? null,
  name: dog.name,
  gender: normalizeGender(dog.gender),
  weight: dog.weight ?? null,
  species: normalizeSpecies(dog.species),
  birthdate: dog.birthdate ?? null,
  activity: normalizeActivity(dog.activity),
  about: dog.about ?? null,
  ownerId: dog.ownerId ?? null,
  avatar: null,
  photoIds: dog.photoIds ?? [],
});

export const mapEnumerationToDogSpecies = (
  item: EnumerationDtoType
): DogSpecies => ({
  value: item.value,
  name: item.name,
});
