import RNPickerSelect from "react-native-picker-select";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface PickerItem {
  label: string;
  value: string;
}

interface FormPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  error?: string | null;
  required?: boolean;
}

/** Dropdown styled for dark theme (states, countries, training type) */
export function FormPicker({
  label,
  value,
  onValueChange,
  items,
  placeholder = "Select an option",
  error,
  required = false,
}: FormPickerProps) {
  return (
    <View className="mb-4">
      <Text className="text-accent-chrome text-sm font-medium mb-1.5">
        {label}
        {required ? <Text className="text-signal-red"> *</Text> : null}
      </Text>
      <View
        className={`bg-asphalt-800 border rounded-xl overflow-hidden ${
          error ? "border-signal-red" : "border-asphalt-700"
        }`}
      >
        <RNPickerSelect
          onValueChange={(v) => onValueChange(v ?? "")}
          items={items}
          value={value || ""}
          placeholder={{ label: placeholder, value: "", color: "#6B7280" }}
          style={{
            inputIOS: {
              color: colors.textPrimary,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 16,
            },
            inputAndroid: {
              color: colors.textPrimary,
              paddingVertical: 12,
              paddingHorizontal: 16,
              fontSize: 16,
            },
            iconContainer: { top: 14, right: 12 },
          }}
          useNativeAndroidPickerStyle={false}
        />
      </View>
    </View>
  );
}
