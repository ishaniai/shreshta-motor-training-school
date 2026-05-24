import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import {
  ApiError,
  loginUser,
  toAuthSession,
} from "@/services/api";
import { initialLoginForm, type LoginFormState } from "@/types/login";
import {
  validateLoginIdentifier,
  validateLoginPassword,
} from "@/utils/loginValidation";

type LoginFieldErrors = Partial<Record<keyof LoginFormState, string>>;

export const INVALID_LOGIN_MESSAGE =
  "Incorrect user/ password combination, try again !";

export function LoginScreen() {
  const router = useRouter();
  const { signIn, session, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<LoginFormState>(initialLoginForm);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/home");
    }
  }, [authLoading, session, router]);

  const update = useCallback(
    <K extends keyof LoginFormState>(key: K, value: LoginFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (authError) setAuthError(null);
    },
    [authError]
  );

  const validateForm = (): boolean => {
    const next: LoginFieldErrors = {};
    next.usernameOrEmail = validateLoginIdentifier(form.usernameOrEmail) ?? undefined;
    next.password = validateLoginPassword(form.password) ?? undefined;

    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined)
    ) as LoginFieldErrors;
    setFieldErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const handleClear = () => {
    setForm(initialLoginForm);
    setFieldErrors({});
    setAuthError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setAuthError(null);

    try {
      const response = await loginUser(form);
      await signIn(toAuthSession(response));
      router.replace("/home");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setAuthError(INVALID_LOGIN_MESSAGE);
      } else if (error instanceof ApiError) {
        setAuthError(error.message);
      } else {
        setAuthError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout
      screenIcon="steering"
      title="Login"
      subtitle="Schedule your training appointment"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow justify-center py-6"
        >
          <View className="bg-asphalt-900/80 border border-asphalt-700 rounded-2xl p-5 mb-6">
            <Text className="text-white text-lg font-semibold mb-1">
              Welcome back
            </Text>
            <Text className="text-gray-400 text-sm mb-5">
              Sign in with your username or registered email
            </Text>

            {authError ? (
              <View className="bg-signal-red/10 border border-signal-red/40 rounded-xl px-4 py-3 mb-4">
                <ValidationMessage message={authError} variant="error" />
              </View>
            ) : null}

            <FormTextInput
              label="Username OR Email ID"
              required
              value={form.usernameOrEmail}
              onChangeText={(t) => update("usernameOrEmail", t)}
              placeholder="username or you@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={fieldErrors.usernameOrEmail}
            />
            {fieldErrors.usernameOrEmail ? (
              <ValidationMessage message={fieldErrors.usernameOrEmail} />
            ) : null}

            <FormTextInput
              label="Password"
              required
              value={form.password}
              onChangeText={(t) => update("password", t)}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              error={fieldErrors.password}
            />
            {fieldErrors.password ? (
              <ValidationMessage message={fieldErrors.password} />
            ) : null}

            <View className="flex-row gap-3 mt-6">
              <PrimaryButton label="Clear" onPress={handleClear} variant="outline" />
              <PrimaryButton
                label="Submit"
                onPress={handleSubmit}
                loading={submitting}
              />
            </View>
          </View>

          <Text className="text-gray-500 text-center text-sm">
            New student?{" "}
            <Pressable onPress={() => router.push("/")}>
              <Text className="text-accent-road underline">
                Register here
              </Text>
            </Pressable>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}
