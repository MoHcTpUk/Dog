import type { CurrentDogProfile } from "@entities/session";
import type { DogProfile } from "./dog.types";

export const mapDogProfileToCurrentDog = (
  dog: DogProfile
): CurrentDogProfile => ({
  id: dog.id,
  name: dog.name,
  avatar: dog.avatar,
  breed: dog.species?.name ?? null,
  age: getAgeFromBirthdate(dog.birthdate),
});

export const getAgeFromBirthdate = (birthdate?: string | null) => {
  if (!birthdate) {
    return null;
  }

  const parsedDate = new Date(birthdate);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const monthDelta = today.getMonth() - parsedDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < parsedDate.getDate())
  ) {
    age -= 1;
  }

  return Math.max(age, 0);
};
