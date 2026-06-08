import { BlurView } from "expo-blur";
import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { FormDatePicker } from "@/components/FormDatePicker";
import { FormPicker } from "@/components/FormPicker";
import { FormRadioGroup } from "@/components/FormRadioGroup";
import { FormTextInput } from "@/components/FormTextInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { SectionHeader } from "@/components/SectionHeader";
import { ValidationMessage } from "@/components/ValidationMessage";
import { INDIAN_STATES_AND_UTS } from "@/constants/indianStates";
import { TRAINING_INTEREST_OPTIONS } from "@/constants/trainingInterests";
import { UN_MEMBER_COUNTRIES } from "@/constants/unCountries";
import { useDebouncedUsernameCheck } from "@/hooks/useDebouncedUsernameCheck";
import { useTheme } from "@/context/ThemeContext";
import { ApiError, registerUser } from "@/services/api";
import { initialRegistrationForm, type RegistrationFormState } from "@/types/registration";
import {
  validateContactNumber, validateDateOfBirth, validateEmail,
  validatePassword, validateRequired, validateUsernameFormat,
} from "@/utils/validation";

type FieldErrors = Partial<Record<keyof RegistrationFormState | "license" | "submit", string>>;
const isWeb = Platform.OS === "web";

export function RegistrationScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [form, setForm] = useState<RegistrationFormState>(initialRegistrationForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const usernameStatus = useDebouncedUsernameCheck(form.username);

  const update = useCallback(<K extends keyof RegistrationFormState>(key: K, value: RegistrationFormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => { const n = { ...p }; delete n[key]; delete n.submit; return n; });
  }, []);

  const stateItems  = useMemo(() => INDIAN_STATES_AND_UTS.map((s) => ({ label: s, value: s })), []);
  const countryItems = useMemo(() => UN_MEMBER_COUNTRIES.map((c) => ({ label: c, value: c })), []);
  const trainingItems = useMemo(() => TRAINING_INTEREST_OPTIONS.map((t) => ({ label: t.label, value: t.value })), []);

  const validateForm = (): boolean => {
    const n: FieldErrors = {};
    n.fullName = validateRequired(form.fullName, "Full name") ?? undefined;
    const uf = validateUsernameFormat(form.username);
    if (uf) n.username = uf;
    else if (usernameStatus === "taken") n.username = "Username already exists !";
    else if (usernameStatus === "checking") n.username = "Please wait for username availability check";
    n.password = validatePassword(form.password) ?? undefined;
    n.contactNumber = validateContactNumber(form.contactNumber) ?? undefined;
    n.email = validateEmail(form.email) ?? undefined;
    n.addressLine1 = validateRequired(form.addressLine1, "Address line 1") ?? undefined;
    n.city = validateRequired(form.city, "City") ?? undefined;
    n.state = validateRequired(form.state, "State") ?? undefined;
    n.dateOfBirth = validateDateOfBirth(form.dateOfBirth) ?? undefined;
    if (form.hasDrivingLicense === null) n.license = "Please select whether you have a driving license";
    if (form.hasDrivingLicense === true) {
      if (!form.drivingLicenseNumber.trim()) n.drivingLicenseNumber = "Driving license number is required";
      if (!form.drivingLicenseCountry) n.drivingLicenseCountry = "Issuing country is required";
    }
    if (!form.trainingInterest) n.trainingInterest = "Please select training interest";
    const cleaned = Object.fromEntries(Object.entries(n).filter(([, v]) => v !== undefined)) as FieldErrors;
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const handleClear = () => { setForm(initialRegistrationForm); setErrors({}); setRegistered(false); };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setErrors((p) => { const n = { ...p }; delete n.submit; return n; });
    try {
      await registerUser(form);
      setRegistered(true);
    } catch (e) {
      if (e instanceof ApiError) {
        const { message, field } = e;
        if (field === "username") setErrors((p) => ({ ...p, username: message }));
        else if (field === "email") setErrors((p) => ({ ...p, email: message }));
        else setErrors((p) => ({ ...p, submit: message }));
      } else {
        setErrors((p) => ({ ...p, submit: "Registration failed. Please try again." }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const accent = isDark ? "#38BDF8" : "#0284C7";
  const textSecondary = isDark ? "#8B9FC7" : "#3D5888";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(99,126,210,0.22)";

  /* ── Success state ─────────────────────────────────────── */
  if (registered) {
    return (
      <ScreenLayout screenIcon="check-decagram" title="Registration Complete" subtitle="Welcome to Shreshta Motor Training School">
        <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: isDark ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.12)", borderWidth: 1, borderColor: "rgba(52,211,153,0.35)", borderRadius: 20, padding: 32, width: "100%", alignItems: "center" }}>
            <Text style={{ color: "#34D399", fontSize: 24, fontWeight: "800", marginBottom: 12 }}>
              Registered Successfully!
            </Text>
            <Pressable onPress={() => router.push("/login")} accessibilityRole="link">
              <Text style={{ color: accent, fontSize: 16, fontWeight: "700", textDecorationLine: "underline" }}>
                Click here to Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenLayout>
    );
  }

  const formContent = (
    <>
      <SectionHeader title="User Information" />
      <FormTextInput label="Full Name" required value={form.fullName} onChangeText={(t) => update("fullName", t)} placeholder="Enter your full name" autoCapitalize="words" error={errors.fullName} />
      <ValidationMessage message={errors.fullName ?? null} />

      <FormTextInput label="Username" required value={form.username} onChangeText={(t) => update("username", t)} placeholder="Choose a unique username" autoCapitalize="none" autoCorrect={false} error={errors.username} />
      {usernameStatus === "checking" && <ValidationMessage message="Checking availability…" variant="info" />}
      {usernameStatus === "taken"    && <ValidationMessage message="Username already exists !" variant="error" />}
      {usernameStatus === "available" && <ValidationMessage message="Username is available" variant="success" />}
      <ValidationMessage message={errors.username ?? null} />

      <FormTextInput label="Password" required value={form.password} onChangeText={(t) => update("password", t)} placeholder="Min 8 chars, 1 capital, 1 number, @ _ # =" secureTextEntry autoCapitalize="none" error={errors.password} />
      <ValidationMessage message={errors.password ?? null} />
      <Text style={{ color: textSecondary, fontSize: 11, marginBottom: 14, marginTop: -8 }}>
        Policy: 1 CAPITAL · 1 number · 1 special from @ _ # =
      </Text>

      <FormTextInput label="Contact Number" required value={form.contactNumber} onChangeText={(t) => update("contactNumber", t)} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} error={errors.contactNumber} />
      <ValidationMessage message={errors.contactNumber ?? null} />

      <FormTextInput label="Email ID" required value={form.email} onChangeText={(t) => update("email", t)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <ValidationMessage message={errors.email ?? null} />

      <SectionHeader title="Address" />
      <FormTextInput label="Address Line 1" required value={form.addressLine1} onChangeText={(t) => update("addressLine1", t)} placeholder="House / street" error={errors.addressLine1} />
      <ValidationMessage message={errors.addressLine1 ?? null} />

      <FormTextInput label="Address Line 2" value={form.addressLine2} onChangeText={(t) => update("addressLine2", t)} placeholder="Area / landmark (optional)" />

      <FormTextInput label="City" required value={form.city} onChangeText={(t) => update("city", t)} placeholder="City" error={errors.city} />
      <ValidationMessage message={errors.city ?? null} />

      <FormPicker label="State" required value={form.state} onValueChange={(v) => update("state", v)} items={stateItems} placeholder="Select state / UT" error={errors.state} />
      <ValidationMessage message={errors.state ?? null} />

      <SectionHeader title="Personal Details" />
      <FormDatePicker label="Date of Birth" required value={form.dateOfBirth} onChange={(d) => update("dateOfBirth", d)} error={errors.dateOfBirth} maximumDate={new Date()} />
      <ValidationMessage message={errors.dateOfBirth ?? null} />

      <SectionHeader title="Driving License" />
      <FormRadioGroup
        label="Have Driving License?"
        value={form.hasDrivingLicense}
        onChange={(v) => { update("hasDrivingLicense", v); if (!v) { update("drivingLicenseNumber", ""); update("drivingLicenseCountry", ""); } }}
        options={[{ label: "Yes", value: true }, { label: "No", value: false }]}
        error={errors.license}
      />

      {form.hasDrivingLicense === true && (
        <>
          <FormTextInput label="Driving License Number" required value={form.drivingLicenseNumber} onChangeText={(t) => update("drivingLicenseNumber", t)} placeholder="License number" error={errors.drivingLicenseNumber} />
          <ValidationMessage message={errors.drivingLicenseNumber ?? null} />
          <FormPicker label="Issuing Country" required value={form.drivingLicenseCountry} onValueChange={(v) => update("drivingLicenseCountry", v)} items={countryItems} placeholder="Select UN member country" error={errors.drivingLicenseCountry} />
          <ValidationMessage message={errors.drivingLicenseCountry ?? null} />
        </>
      )}

      <SectionHeader title="Training Interest" />
      <FormPicker label="Training Interest" required value={form.trainingInterest} onValueChange={(v) => update("trainingInterest", v as RegistrationFormState["trainingInterest"])} items={trainingItems} placeholder="2 Wheeler / 4 Wheeler / Both" error={errors.trainingInterest} />
      <ValidationMessage message={errors.trainingInterest ?? null} />

      {errors.submit && <ValidationMessage message={errors.submit} />}

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16, marginBottom: 32 }}>
        <PrimaryButton label="Clear" onPress={handleClear} variant="outline" />
        <PrimaryButton label="Register" onPress={handleSubmit} loading={submitting} disabled={usernameStatus === "checking"} />
      </View>

      <Text style={{ color: textSecondary, textAlign: "center", fontSize: 13, marginBottom: 20 }}>
        Already registered?{" "}
        <Text onPress={() => router.push("/login")} style={{ color: accent, fontWeight: "700", textDecorationLine: "underline" }}>
          Login
        </Text>
      </Text>
    </>
  );

  return (
    <ScreenLayout screenIcon="car-key" title="New Registration" subtitle="Join Shreshta Motor Training School">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isWeb ? (
          <div
            style={{
              backgroundColor: cardBg,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${cardBorder}`,
              borderRadius: 24,
              padding: 24,
              boxShadow: isDark
                ? "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 8px 40px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
              marginBottom: 16,
            } as any}
          >
            {formContent}
          </div>
        ) : (
          <BlurView
            intensity={50}
            tint={isDark ? "dark" : "light"}
            style={{ borderRadius: 24, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: cardBorder }}
          >
            <View style={{ padding: 20 }}>{formContent}</View>
          </BlurView>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
