import bcrypt from "bcrypt";
import { supabaseAdmin } from "../lib/supabase";
import type { LoginBody } from "../validation/login";
import type { RegisterBody } from "../validation/registration";

const BCRYPT_ROUNDS = 12;

export async function isUsernameTaken(username: string): Promise<boolean> {
  console.log("[user-service] isUsernameTaken called with:", username.trim());
  
  try {
    // Try RPC with 5-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("RPC timeout")), 5000)
    );
    
    const rpcCall = supabaseAdmin.rpc("is_username_taken", {
      p_username: username.trim(),
    });
    
    const { data, error } = await Promise.race([
      rpcCall as any,
      timeoutPromise as any,
    ]) as any;

    if (error) {
      console.error("[user-service] RPC error:", error);
      throw new Error(`Username check failed: ${error.message}`);
    }

    console.log("[user-service] RPC response:", { data, taken: Boolean(data) });
    return Boolean(data);
  } catch (rpcErr) {
    console.warn("[user-service] RPC failed, falling back to direct query:", rpcErr);
    
    // Fallback: query users table directly
    try {
      const { count, error: queryError } = await supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .ilike("username", username.trim());
      
      if (queryError) {
        console.error("[user-service] Fallback query error:", queryError);
        throw queryError;
      }
      
      const taken = (count ?? 0) > 0;
      console.log("[user-service] Fallback query result:", { username: username.trim(), taken });
      return taken;
    } catch (fallbackErr) {
      console.error("[user-service] Both RPC and fallback failed:", fallbackErr);
      throw new Error(`Username check failed: ${fallbackErr instanceof Error ? fallbackErr.message : "Unknown error"}`);
    }
  }
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();

  if (error) {
    throw new Error(`Email check failed: ${error.message}`);
  }

  return Boolean(data);
}

export async function registerUser(body: RegisterBody) {
  const usernameTaken = await isUsernameTaken(body.username);
  if (usernameTaken) {
    return { ok: false as const, code: "USERNAME_TAKEN" as const };
  }

  const emailTaken = await isEmailTaken(body.email);
  if (emailTaken) {
    return { ok: false as const, code: "EMAIL_TAKEN" as const };
  }

  const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

  const row = {
    full_name: body.fullName,
    username: body.username.trim(),
    password_hash: passwordHash,
    contact_number: body.contactNumber,
    email: body.email.trim().toLowerCase(),
    address_line_1: body.addressLine1,
    address_line_2: body.addressLine2 || null,
    city: body.city,
    state: body.state,
    date_of_birth: body.dateOfBirth,
    has_driving_license: body.hasDrivingLicense,
    driving_license_number: body.hasDrivingLicense ? body.drivingLicenseNumber!.trim() : null,
    driving_license_country: body.hasDrivingLicense ? body.drivingLicenseCountry! : null,
    training_interest: body.trainingInterest,
  };

  const { data, error } = await supabaseAdmin.from("users").insert(row).select("id, username").single();

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("username")) {
        return { ok: false as const, code: "USERNAME_TAKEN" as const };
      }
      if (error.message.includes("email")) {
        return { ok: false as const, code: "EMAIL_TAKEN" as const };
      }
    }
    throw new Error(`Registration failed: ${error.message}`);
  }

  return { ok: true as const, user: data };
}

type UserAuthRow = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  password_hash: string;
};

/** Find user by username or email for login */
async function findUserByIdentifier(identifier: string): Promise<UserAuthRow | null> {
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes("@");

  let query = supabaseAdmin
    .from("users")
    .select("id, username, full_name, email, password_hash");

  if (isEmail) {
    query = query.ilike("email", trimmed.toLowerCase());
  } else {
    query = query.ilike("username", trimmed);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(`Login lookup failed: ${error.message}`);
  }

  return data;
}

export async function authenticateUser(body: LoginBody) {
  const user = await findUserByIdentifier(body.usernameOrEmail);
  if (!user) {
    return { ok: false as const, code: "INVALID_CREDENTIALS" as const };
  }

  const passwordMatch = await bcrypt.compare(body.password, user.password_hash);
  if (!passwordMatch) {
    return { ok: false as const, code: "INVALID_CREDENTIALS" as const };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
    },
  };
}

export async function getUserPublicProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, full_name, email, training_interest")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Profile fetch failed: ${error.message}`);
  }

  return data;
}

export async function getUserContactDetails(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, full_name, email, contact_number")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Profile fetch failed: ${error.message}`);
  }

  return data;
}
