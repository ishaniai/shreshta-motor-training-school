import { Text, type TextProps } from "react-native";

type Variant = "error" | "success" | "info";

interface ValidationMessageProps extends TextProps {
  message: string | null;
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  error: "text-signal-red text-sm mt-1",
  success: "text-signal-green text-sm mt-1",
  info: "text-accent-road text-sm mt-1",
};

/** Inline validation text — red for errors, green for success */
export function ValidationMessage({
  message,
  variant = "error",
  ...rest
}: ValidationMessageProps) {
  if (!message) return null;
  return (
    <Text className={variantClass[variant]} accessibilityLiveRegion="polite" {...rest}>
      {message}
    </Text>
  );
}
