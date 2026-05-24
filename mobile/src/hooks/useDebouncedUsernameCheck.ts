import { useEffect, useRef, useState } from "react";
import { checkUsernameAvailable } from "@/services/api";
import type { UsernameAvailability } from "@/types/registration";
import { validateUsernameFormat } from "@/utils/validation";

const DEBOUNCE_MS = 450;

/**
 * Debounced Supabase username check via Express API.
 */
export function useDebouncedUsernameCheck(username: string) {
  const [status, setStatus] = useState<UsernameAvailability>("idle");
  const requestId = useRef(0);

  useEffect(() => {
    console.log("[usernameCheck] Input changed:", username);
    
    const formatError = validateUsernameFormat(username);
    if (formatError || username.trim().length < 3) {
      console.log("[usernameCheck] Format validation failed or too short");
      setStatus("idle");
      return;
    }

    console.log("[usernameCheck] Setting status to checking");
    setStatus("checking");
    const currentId = ++requestId.current;

    const timer = setTimeout(async () => {
      console.log("[usernameCheck] Timeout elapsed, calling API for:", username);
      try {
        const result = await checkUsernameAvailable(username);
        console.log("[usernameCheck] API response:", result);
        
        if (currentId !== requestId.current) {
          console.log("[usernameCheck] Request stale, ignoring response");
          return;
        }
        
        const newStatus = result.available ? "available" : "taken";
        console.log("[usernameCheck] Setting status to:", newStatus);
        setStatus(newStatus);
      } catch (err) {
        console.error("[usernameCheck] API error:", err);
        if (currentId !== requestId.current) {
          console.log("[usernameCheck] Request stale, ignoring error");
          return;
        }
        console.log("[usernameCheck] Setting status to idle due to error");
        setStatus("idle");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [username]);

  return status;
}
