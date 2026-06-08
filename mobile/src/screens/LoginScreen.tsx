import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { FormTextInput } from "@/components/FormTextInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { ValidationMessage } from "@/components/ValidationMessage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ApiError, loginUser, toAuthSession } from "@/services/api";
import { initialLoginForm, type LoginFormState } from "@/types/login";
import { validateLoginIdentifier, validateLoginPassword } from "@/utils/loginValidation";

type LoginFieldErrors = Partial<Record<keyof LoginFormState, string>>;
const isWeb = Platform.OS === "web";
export const INVALID_LOGIN_MESSAGE = "Incorrect user / password combination, try again !";

export function LoginScreen() {
  const router = useRouter();
  // session redirect is handled in login.tsx route file — no useEffect needed here.
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState<LoginFormState>(initialLoginForm);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = useCallback(<K extends keyof LoginFormState>(key: K, value: LoginFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setFieldErrors((p) => { const n = { ...p }; delete n[key]; return n; });
    if (authError) setAuthError(null);
  }, [authError]);

  const validateForm = () => {
    const n: LoginFieldErrors = {};
    const e1 = validateLoginIdentifier(form.usernameOrEmail);
    if (e1) n.usernameOrEmail = e1;
    const e2 = validateLoginPassword(form.password);
    if (e2) n.password = e2;
    setFieldErrors(n);
    return Object.keys(n).length === 0;
  };

  const handleClear = () => { setForm(initialLoginForm); setFieldErrors({}); setAuthError(null); };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true); setAuthError(null);
    try {
      const res = await loginUser(form);
      await signIn(toAuthSession(res));
      router.replace("/home");
    } catch (e) {
      setAuthError(
        e instanceof ApiError && e.status === 401
          ? INVALID_LOGIN_MESSAGE
          : e instanceof ApiError
          ? e.message
          : "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const accent = isDark ? "#38BDF8" : "#0284C7";
  const textPrimary = isDark ? "#F0F6FF" : "#071240";
  const textSecondary = isDark ? "#8B9FC7" : "#3D5888";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.75)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.25)";

  return (
    <ScreenLayout screenIcon="steering" title="Login" subtitle="Schedule your training today">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Glass card ── */}
          {isWeb ? (
            <div
              style={{
                backgroundColor: cardBg,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${cardBorder}`,
                borderRadius: 24,
                padding: 28,
                boxShadow: isDark
                  ? "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "0 8px 40px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                marginBottom: 20,
              } as any}
            >
              <CardContent
                isDark={isDark} accent={accent} textPrimary={textPrimary} textSecondary={textSecondary}
                authError={authError} form={form} fieldErrors={fieldErrors} submitting={submitting}
                update={update} handleClear={handleClear} handleSubmit={handleSubmit}
              />
            </div>
          ) : (
            <BlurView
              intensity={60}
              tint={isDark ? "dark" : "light"}
              style={{ borderRadius: 24, overflow: "hidden", marginBottom: 20, borderWidth: 1, borderColor: cardBorder }}
            >
              <View style={{ padding: 24 }}>
                <CardContent
                  isDark={isDark} accent={accent} textPrimary={textPrimary} textSecondary={textSecondary}
                  authError={authError} form={form} fieldErrors={fieldErrors} submitting={submitting}
                  update={update} handleClear={handleClear} handleSubmit={handleSubmit}
                />
              </View>
            </BlurView>
          )}

          {/* Register link */}
          <Text style={{ color: textSecondary, textAlign: "center", fontSize: 13 }}>
            New student?{" "}
            <Text
              onPress={() => router.push("/")}
              style={{ color: accent, fontWeight: "700", textDecorationLine: "underline" }}
            >
              Register here
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

function CardContent({
  isDark, accent, textPrimary, textSecondary,
  authError, form, fieldErrors, submitting,
  update, handleClear, handleSubmit,
}: any) {
  return (
    <>
      <Text style={{ color: textPrimary, fontSize: 22, fontWeight: "800", marginBottom: 4 }}>
        Welcome back
      </Text>
      <Text style={{ color: textSecondary, fontSize: 13, marginBottom: 20 }}>
        Sign in with your username or registered email
      </Text>

      {authError ? (
        <View style={{ backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <ValidationMessage message={authError} variant="error" />
        </View>
      ) : null}

      <FormTextInput
        label="Username or Email"
        required
        value={form.usernameOrEmail}
        onChangeText={(t: string) => update("usernameOrEmail", t)}
        placeholder="username or you@email.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        error={fieldErrors.usernameOrEmail}
      />
      <ValidationMessage message={fieldErrors.usernameOrEmail ?? null} />

      <FormTextInput
        label="Password"
        required
        value={form.password}
        onChangeText={(t: string) => update("password", t)}
        placeholder="Enter your password"
        secureTextEntry
        autoCapitalize="none"
        error={fieldErrors.password}
      />
      <ValidationMessage message={fieldErrors.password ?? null} />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        <PrimaryButton label="Clear" onPress={handleClear} variant="outline" />
        <PrimaryButton label="Login" onPress={handleSubmit} loading={submitting} />
      </View>
    </>
  );
}
