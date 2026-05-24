import { Link, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
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
import { ApiError, registerUser } from "@/services/api";
import {
  initialRegistrationForm,
  type RegistrationFormState,
} from "@/types/registration";
import {
  validateContactNumber,
  validateDateOfBirth,
  validateEmail,
  validatePassword,
  validateRequired,
  validateUsernameFormat,
} from "@/utils/validation";

type FieldErrors = Partial<Record<keyof RegistrationFormState | "license" | "submit", string>>;

export function RegistrationScreen() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationFormState>(initialRegistrationForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const usernameStatus = useDebouncedUsernameCheck(form.username);

  const update = useCallback(
    <K extends keyof RegistrationFormState>(key: K, value: RegistrationFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        delete next.submit;
        return next;
      });
    },
    []
  );

  const stateItems = useMemo(
    () => INDIAN_STATES_AND_UTS.map((s) => ({ label: s, value: s })),
    []
  );
  const countryItems = useMemo(
    () => UN_MEMBER_COUNTRIES.map((c) => ({ label: c, value: c })),
    []
  );
  const trainingItems = useMemo(
    () => TRAINING_INTEREST_OPTIONS.map((t) => ({ label: t.label, value: t.value })),
    []
  );

  const validateForm = (): boolean => {
    const next: FieldErrors = {};

    next.fullName = validateRequired(form.fullName, "Full name") ?? undefined;
    const userFormat = validateUsernameFormat(form.username);
    if (userFormat) next.username = userFormat;
    else if (usernameStatus === "taken") next.username = "Username already exists !";
    else if (usernameStatus === "checking")
      next.username = "Please wait for username availability check";
    next.password = validatePassword(form.password) ?? undefined;
    next.contactNumber = validateContactNumber(form.contactNumber) ?? undefined;
    next.email = validateEmail(form.email) ?? undefined;
    next.addressLine1 = validateRequired(form.addressLine1, "Address line 1") ?? undefined;
    next.city = validateRequired(form.city, "City") ?? undefined;
    next.state = validateRequired(form.state, "State") ?? undefined;
    next.dateOfBirth = validateDateOfBirth(form.dateOfBirth) ?? undefined;
    if (form.hasDrivingLicense === null) {
      next.license = "Please select whether you have a driving license";
    }
    if (form.hasDrivingLicense === true) {
      if (!form.drivingLicenseNumber.trim()) {
        next.drivingLicenseNumber = "Driving license number is required";
      }
      if (!form.drivingLicenseCountry) {
        next.drivingLicenseCountry = "Issuing country is required";
      }
    }
    if (!form.trainingInterest) {
      next.trainingInterest = "Please select training interest";
    }

    const cleaned = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== undefined)
    ) as FieldErrors;
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  };

  const handleClear = () => {
    setForm(initialRegistrationForm);
    setErrors({});
    setRegistered(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.submit;
      return next;
    });

    try {
      await registerUser(form);
      setRegistered(true);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const { message, field } = error;
        if (field === "username") {
          setErrors((prev) => ({ ...prev, username: message }));
        } else if (field === "email") {
          setErrors((prev) => ({ ...prev, email: message }));
        } else {
          setErrors((prev) => ({ ...prev, submit: message }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          submit: "Registration failed. Please try again.",
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDob = (date: Date | null) => {
    if (!date) return "Tap to select date of birth";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const showLicenseFields = form.hasDrivingLicense === true;

  if (registered) {
    return (
      <ScreenLayout
        screenIcon="check-decagram"
        title="Registration Complete"
        subtitle="Welcome to Shreshta Motor Training School"
      >
        <View className="flex-1 px-5 justify-center items-center">
          <Text className="text-signal-green text-xl font-semibold text-center mb-4">
            Registered successfully
          </Text>
          <Pressable
            onPress={() => router.push("/login")}
            accessibilityRole="link"
          >
            <Text className="text-accent-road text-lg underline">Click here</Text>
          </Pressable>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            to go to the Login Page
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      screenIcon="car-key"
      title="New Registration"
      subtitle="Join Shreshta Motor Training School"
    >
      <ScrollView
        className="flex-1 px-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="User Information" />

        <FormTextInput
          label="Full Name"
          required
          value={form.fullName}
          onChangeText={(t) => update("fullName", t)}
          placeholder="Enter your full name"
          autoCapitalize="words"
          error={errors.fullName}
        />
        {errors.fullName ? <ValidationMessage message={errors.fullName} /> : null}

        <FormTextInput
          label="Username"
          required
          value={form.username}
          onChangeText={(t) => update("username", t)}
          placeholder="Choose a unique username"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.username}
        />
        {usernameStatus === "checking" ? (
          <ValidationMessage message="Checking availability…" variant="info" />
        ) : null}
        {usernameStatus === "taken" ? (
          <ValidationMessage message="Username already exists !" variant="error" />
        ) : null}
        {usernameStatus === "available" ? (
          <ValidationMessage message="Username is available" variant="success" />
        ) : null}
        {errors.username ? <ValidationMessage message={errors.username} /> : null}

        <FormTextInput
          label="Password"
          required
          value={form.password}
          onChangeText={(t) => update("password", t)}
          placeholder="Min 8 chars, 1 capital, 1 number, @ _ # ="
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />
        {errors.password ? <ValidationMessage message={errors.password} /> : null}
        <Text className="text-gray-500 text-xs mb-3 -mt-2">
          Policy: 1 CAPITAL letter, 1 number, 1 special from @ _ # =
        </Text>

        <FormTextInput
          label="Contact Number"
          required
          value={form.contactNumber}
          onChangeText={(t) => update("contactNumber", t)}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.contactNumber}
        />
        {errors.contactNumber ? <ValidationMessage message={errors.contactNumber} /> : null}

        <FormTextInput
          label="Email ID"
          required
          value={form.email}
          onChangeText={(t) => update("email", t)}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        {errors.email ? <ValidationMessage message={errors.email} /> : null}

        <SectionHeader title="Address" />

        <FormTextInput
          label="Address Line 1"
          required
          value={form.addressLine1}
          onChangeText={(t) => update("addressLine1", t)}
          placeholder="House / street"
          error={errors.addressLine1}
        />
        {errors.addressLine1 ? <ValidationMessage message={errors.addressLine1} /> : null}

        <FormTextInput
          label="Address Line 2"
          value={form.addressLine2}
          onChangeText={(t) => update("addressLine2", t)}
          placeholder="Area / landmark (optional)"
        />

        <FormTextInput
          label="City"
          required
          value={form.city}
          onChangeText={(t) => update("city", t)}
          placeholder="City"
          error={errors.city}
        />
        {errors.city ? <ValidationMessage message={errors.city} /> : null}

        <FormPicker
          label="State"
          required
          value={form.state}
          onValueChange={(v) => update("state", v)}
          items={stateItems}
          placeholder="Select state / UT"
          error={errors.state}
        />
        {errors.state ? <ValidationMessage message={errors.state} /> : null}

        <SectionHeader title="Personal Details" />

        <FormDatePicker
          label="Date of Birth"
          required
          value={form.dateOfBirth}
          onChange={(date) => update("dateOfBirth", date)}
          error={errors.dateOfBirth}
          maximumDate={new Date()}
        />

        <SectionHeader title="Driving License" />

        <FormRadioGroup
          label="Have Driving License?"
          value={form.hasDrivingLicense}
          onChange={(v) => {
            update("hasDrivingLicense", v);
            if (!v) {
              update("drivingLicenseNumber", "");
              update("drivingLicenseCountry", "");
            }
          }}
          options={[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ]}
          error={errors.license}
        />

        {showLicenseFields ? (
          <>
            <FormTextInput
              label="Driving License Number"
              required
              value={form.drivingLicenseNumber}
              onChangeText={(t) => update("drivingLicenseNumber", t)}
              placeholder="License number"
              error={errors.drivingLicenseNumber}
            />
            {errors.drivingLicenseNumber ? (
              <ValidationMessage message={errors.drivingLicenseNumber} />
            ) : null}

            <FormPicker
              label="Driving License Issuing Country"
              required
              value={form.drivingLicenseCountry}
              onValueChange={(v) => update("drivingLicenseCountry", v)}
              items={countryItems}
              placeholder="Select UN member country"
              error={errors.drivingLicenseCountry}
            />
            {errors.drivingLicenseCountry ? (
              <ValidationMessage message={errors.drivingLicenseCountry} />
            ) : null}
          </>
        ) : null}

        <SectionHeader title="Training Interest" />

        <FormPicker
          label="Training Interest"
          required
          value={form.trainingInterest}
          onValueChange={(v) =>
            update("trainingInterest", v as RegistrationFormState["trainingInterest"])
          }
          items={trainingItems}
          placeholder="2 Wheeler / 4 Wheeler / Both"
          error={errors.trainingInterest}
        />
        {errors.trainingInterest ? (
          <ValidationMessage message={errors.trainingInterest} />
        ) : null}

        {errors.submit ? (
          <ValidationMessage message={errors.submit} />
        ) : null}

        <View className="flex-row gap-3 mt-4 mb-8">
          <PrimaryButton label="Clear" onPress={handleClear} variant="outline" />
          <PrimaryButton
            label="Submit"
            onPress={handleSubmit}
            loading={submitting}
            disabled={usernameStatus === "checking"}
          />
        </View>

        <Text className="text-gray-500 text-center text-sm mb-6">
          Already registered?{" "}
          <Link href="/login" className="text-accent-road underline">
            Login
          </Link>
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
}
