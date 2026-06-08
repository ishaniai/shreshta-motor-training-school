import { Platform, Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FormTextInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
}

export function FormTextInput({
  label,
  error,
  required = false,
  style,
  ...props
}: FormTextInputProps) {
  const { isDark } = useTheme();

  const labelColor   = isDark ? "#8B9FC7" : "#3D5888";
  const borderColor  = error
    ? "rgba(239,68,68,0.7)"
    : isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.3)";
  const bgColor      = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)";
  const textColor    = isDark ? "#F0F6FF" : "#071240";
  const placeholder  = isDark ? "rgba(139,159,199,0.6)" : "rgba(61,88,136,0.45)";

  // Single TextInput works on web AND native — it internally maps onChangeText → onChange.
  // Splitting into a raw <input> broke onChangeText on web.
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 6, letterSpacing: 0.3 }}>
        {label}
        {required ? <Text style={{ color: "#EF4444" }}> *</Text> : null}
      </Text>

      <TextInput
        placeholderTextColor={placeholder}
        style={[
          {
            backgroundColor: bgColor,
            borderWidth: 1,
            borderColor,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 13,
            color: textColor,
            fontSize: 15,
            // React Native Web passes these to the DOM — gives glass effect on web,
            // harmlessly ignored on native.
            ...(Platform.OS === "web"
              ? ({
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  outlineStyle: "none",
                  boxSizing: "border-box",
                } as any)
              : {}),
          },
          style,
        ]}
        {...props}
      />

      {error ? (
        <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}
