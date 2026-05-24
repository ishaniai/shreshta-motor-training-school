import { Platform } from "react-native";
import type { AuthSession } from "@/types/session";

const SESSION_KEY = "shreshta_auth_session";

// Detect if we're in a web environment
const isWeb = Platform.OS === "web";

// Safe localStorage access
const getLocalStorage = (): Storage | null => {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage;
    }
  } catch (e) {
    // localStorage might not be available
  }
  return null;
};

/** Persist login session securely on device */
export async function saveSession(session: AuthSession): Promise<void> {
  if (isWeb) {
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } else {
    try {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    let raw: string | null = null;

    if (isWeb) {
      const storage = getLocalStorage();
      if (storage) {
        raw = storage.getItem(SESSION_KEY);
      }
    } else {
      try {
        const SecureStore = await import("expo-secure-store");
        raw = await SecureStore.getItemAsync(SESSION_KEY);
      } catch (e) {
        console.error("Failed to load session from SecureStore:", e);
      }
    }

    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch (e) {
    console.error("Failed to parse session:", e);
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    if (isWeb) {
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(SESSION_KEY);
      }
    } else {
      try {
        const SecureStore = await import("expo-secure-store");
        await SecureStore.deleteItemAsync(SESSION_KEY);
      } catch (e) {
        console.error("Failed to clear session from SecureStore:", e);
      }
    }
  } catch (e) {
    console.error("Failed to clear session:", e);
  }
}
