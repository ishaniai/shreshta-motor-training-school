import { Text, type TextProps } from "react-native";

type Variant = "error" | "success" | "info";

interface ValidationMessageProps extends TextProps {
  message: string | null;
  variant?: Variant;
}

const variantStyle: Record<Variant, object> = {
  error:   { color: "#F87171", fontSize: 12, marginTop: 4 },
  success: { color: "#34D399", fontSize: 12, marginTop: 4 },
  info:    { color: "#38BDF8", fontSize: 12, marginTop: 4 },
};

export function ValidationMessage({ message, variant = "error", ...rest }: ValidationMessageProps) {
  if (!message) return null;
  return (
    <Text style={variantStyle[variant]} accessibilityLiveRegion="polite" {...rest}>
      {message}
    </Text>
  );
}
