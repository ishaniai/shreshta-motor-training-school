import RNPickerSelect from "react-native-picker-select";
import { Platform, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface PickerItem { label: string; value: string; }

interface FormPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  error?: string | null;
  required?: boolean;
}

const isWeb = Platform.OS === "web";

export function FormPicker({
  label,
  value,
  onValueChange,
  items,
  placeholder = "Select an option",
  error,
  required = false,
}: FormPickerProps) {
  const { isDark } = useTheme();

  const labelColor = isDark ? "#8B9FC7" : "#3D5888";
  const borderColor = error
    ? "rgba(239,68,68,0.7)"
    : isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(99,126,210,0.3)";
  const bgColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)";
  const textColor = isDark ? "#F0F6FF" : "#071240";
  const placeholderColor = isDark ? "rgba(139,159,199,0.6)" : "rgba(61,88,136,0.45)";

  if (isWeb) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
          {label}{required ? <Text style={{ color: "#EF4444" }}> *</Text> : null}
        </Text>
        <select
          value={value || ""}
          onChange={(e) => onValueChange(e.target.value)}
          style={{
            backgroundColor: bgColor,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: "13px 16px",
            color: value ? textColor : placeholderColor as string,
            fontSize: 15,
            fontFamily: "system-ui, -apple-system, sans-serif",
            width: "100%",
            boxSizing: "border-box",
            outline: "none",
            cursor: "pointer",
          } as any}
        >
          <option value="" disabled>{placeholder}</option>
          {items.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        {error ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
        {label}{required ? <Text style={{ color: "#EF4444" }}> *</Text> : null}
      </Text>
      <View
        style={{
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <RNPickerSelect
          onValueChange={(v) => onValueChange(v ?? "")}
          items={items}
          value={value || ""}
          placeholder={{ label: placeholder, value: "", color: placeholderColor as string }}
          style={{
            inputIOS: { color: textColor, paddingVertical: 13, paddingHorizontal: 16, fontSize: 15 },
            inputAndroid: { color: textColor, paddingVertical: 11, paddingHorizontal: 16, fontSize: 15 },
            iconContainer: { top: 14, right: 12 },
          }}
          useNativeAndroidPickerStyle={false}
        />
      </View>
      {error ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}
