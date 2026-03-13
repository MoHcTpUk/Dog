import type { DogSpecies } from "@entities/dog";

export interface DogProfileData {
  name: string;
  gender: "male" | "female" | "";
  weight: number;
  breed: DogSpecies | null;
  birthDate: { day: number; month: number; year: number };
  health: {
    sterilized: boolean;
    vaccinated: boolean;
    parasite_treated: boolean;
  };
  character: {
    activity: "low" | "medium" | "high" | "";
    comfortable_with: {
      big_dogs: boolean;
      small_dogs: boolean;
      same_size: boolean;
      males: boolean;
      females: boolean;
    };
  };
  comment: string;
  photos: string[];
  owner: {
    photo: string | null;
    name: string;
    birth_date: string | null;
  };
}

export interface StepErrors {
  name?: string;
  gender?: string;
  breed?: string;
  ownerName?: string;
}
