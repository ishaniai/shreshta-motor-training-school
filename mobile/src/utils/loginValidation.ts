const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

/**
 * Login identifier: either email or username format.
 */
export function validateLoginIdentifier(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Username or Email ID is required";

  if (trimmed.includes("@")) {
    if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
    return null;
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return "Enter a valid username or email address";
  }

  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return "Password is required";
  return null;
}
