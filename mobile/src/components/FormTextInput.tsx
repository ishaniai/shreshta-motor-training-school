import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

interface FormTextInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
}

/** Labeled text field with dark theme styling */
export function FormTextInput({
  label,
  error,
  required = false,
  className,
  ...props
}: FormTextInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-accent-chrome text-sm font-medium mb-1.5">
        {label}
        {required ? <Text className="text-signal-red"> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor="#6B7280"
        className={`bg-asphalt-800 border rounded-xl px-4 py-3 text-white text-base ${
          error ? "border-signal-red" : "border-asphalt-700"
        } ${className ?? ""}`}
        {...props}
      />
    </View>
  );
}
