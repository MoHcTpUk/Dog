import type { SpeciesType } from "@shared/api/generated/types";
import { Activity, Gender } from "./dog.enums";

export interface DogSpecies {
  value: number;
  name: string;
}

export interface DogProfile {
  id: string | null;
  name: string;
  gender: Gender;
  weight: number | null;
  species: DogSpecies | null;
  birthdate: string | null;
  activity: Activity | null;
  about: string | null;
  ownerId: string | null;
  avatar: string | null;
}

export const isDogSpecies = (value: SpeciesType | null | undefined): value is DogSpecies =>
  typeof value?.value === "number" && typeof value?.name === "string";
