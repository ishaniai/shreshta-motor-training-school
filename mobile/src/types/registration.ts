/** Form shape for registration — mirrors Supabase `users` table */
export type TrainingInterest = "2 Wheeler" | "4 Wheeler" | "Both";

export type UsernameAvailability = "idle" | "checking" | "taken" | "available";

export interface RegistrationFormState {
  fullName: string;
  username: string;
  password: string;
  contactNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  dateOfBirth: Date | null;
  hasDrivingLicense: boolean | null;
  drivingLicenseNumber: string;
  drivingLicenseCountry: string;
  trainingInterest: TrainingInterest | "";
}

export const initialRegistrationForm: RegistrationFormState = {
  fullName: "",
  username: "",
  password: "",
  contactNumber: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  dateOfBirth: null,
  hasDrivingLicense: null,
  drivingLicenseNumber: "",
  drivingLicenseCountry: "",
  trainingInterest: "",
};
