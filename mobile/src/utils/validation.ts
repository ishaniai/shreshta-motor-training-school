/**
 * Client-side validation helpers (Registration UI — Step 1).
 * Username DB availability is wired in Step 2 via Supabase RPC.
 */

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_SPECIAL_CHARS = /[@_#=]/;

export function validateUsernameFormat(username: string): string | null {
  if (!username.trim()) return "Username is required";
  if (!USERNAME_REGEX.test(username.trim())) {
    return "Username must be 3–30 characters (letters, numbers, underscore)";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (!/[A-Z]/.test(password)) return "Include at least 1 CAPITAL letter";
  if (!/[0-9]/.test(password)) return "Include at least 1 number";
  if (!PASSWORD_SPECIAL_CHARS.test(password)) {
    return "Include at least 1 special character from @, _, #, =";
  }
  if (password.length < 8) return "Password must be at least 8 characters";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address";
  return null;
}

export function validateContactNumber(number: string): string | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "Contact number is required";
  if (!PHONE_REGEX.test(digits)) return "Enter a valid 10-digit Indian mobile number";
  return null;
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  return age;
}

export function validateDateOfBirth(dateOfBirth: Date | null): string | null {
  if (!dateOfBirth) return "Date of birth is required";
  if (calculateAge(dateOfBirth) < 18) {
    return "You must be at least 18 years old to register";
  }
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}
