import type { LoginFormState } from "@/types/login";
import type { RegistrationFormState } from "@/types/registration";
import type { AuthSession, SessionUser } from "@/types/session";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public field?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const url = `${API_URL.replace(/\/$/, "")}${path}`;
  console.log("[api] Requesting:", url);
  
  let response: Response;
  const { token, ...fetchOptions } = options ?? {};

  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers ?? {}),
      },
    });
  } catch (err) {
    console.error(`[api] Failed to fetch ${url}:`, err);
    throw new ApiError(
      "Cannot reach server. Check EXPO_PUBLIC_API_URL and that the backend is running.",
      0
    );
  }

  let data: T & {
    message?: string;
    field?: string;
  };

  try {
    data = (await response.json()) as T & {
      message?: string;
      field?: string;
    };
    console.log("[api] Response OK:", { status: response.status, data });
  } catch (err) {
    console.warn("[api] Failed to parse JSON response:", err);
    data = {} as T & {
      message?: string;
      field?: string;
    };
  }

  if (!response.ok) {
    console.error(
      `[api] Request failed: ${response.status} ${response.statusText}`,
      `URL: ${url}`,
      `Response:`,
      data
    );
    throw new ApiError(
      (data as { message?: string }).message ?? "Request failed",
      response.status,
      (data as { field?: string }).field
    );
  }

  return data;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  message: string;
}

export async function checkUsernameAvailable(
  username: string
): Promise<UsernameAvailabilityResponse> {
  const params = new URLSearchParams({ username: username.trim() });
  return request<UsernameAvailabilityResponse>(
    `/api/auth/username-available?${params.toString()}`
  );
}

/** ISO date YYYY-MM-DD for Postgres */
export function formatDateForApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formToRegisterPayload(form: RegistrationFormState) {
  if (!form.dateOfBirth || form.hasDrivingLicense === null || !form.trainingInterest) {
    throw new Error("Incomplete form");
  }

  return {
    fullName: form.fullName.trim(),
    username: form.username.trim(),
    password: form.password,
    contactNumber: form.contactNumber.replace(/\D/g, ""),
    email: form.email.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim(),
    city: form.city.trim(),
    state: form.state,
    dateOfBirth: formatDateForApi(form.dateOfBirth),
    hasDrivingLicense: form.hasDrivingLicense,
    drivingLicenseNumber: form.hasDrivingLicense
      ? form.drivingLicenseNumber.trim()
      : undefined,
    drivingLicenseCountry: form.hasDrivingLicense
      ? form.drivingLicenseCountry
      : undefined,
    trainingInterest: form.trainingInterest,
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export async function registerUser(
  form: RegistrationFormState
): Promise<RegisterResponse> {
  const body = formToRegisterPayload(form);
  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: SessionUser;
}

export async function loginUser(form: LoginFormState): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      usernameOrEmail: form.usernameOrEmail.trim(),
      password: form.password,
    }),
  });
}

export async function fetchCurrentUser(token: string): Promise<{ user: SessionUser }> {
  return request<{ success: boolean; user: SessionUser }>("/api/auth/me", {
    token,
  });
}

export function toAuthSession(response: LoginResponse): AuthSession {
  return {
    token: response.token,
    user: response.user,
  };
}
