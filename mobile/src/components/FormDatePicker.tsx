import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string | null;
  required?: boolean;
  maximumDate?: Date;
  minimumDate?: Date;
}

const isWeb = Platform.OS === "web";

function fmt(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtInput(date: Date | null) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function FormDatePicker({ label, value, onChange, error, required = false, maximumDate, minimumDate }: FormDatePickerProps) {
  const { isDark } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const labelColor = isDark ? "#8B9FC7" : "#3D5888";
  const borderColor = error
    ? "rgba(239,68,68,0.7)"
    : isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.3)";
  const bgColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)";
  const textColor = isDark ? "#F0F6FF" : "#071240";
  const placeholderColor = isDark ? "rgba(139,159,199,0.6)" : "rgba(61,88,136,0.45)";

  if (isWeb) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
          {label}{required ? <Text style={{ color: "#EF4444" }}> *</Text> : null}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <input
              type="date"
              value={fmtInput(value)}
              min={fmtInput(minimumDate ?? null)}
              max={fmtInput(maximumDate ?? null)}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  onChange(new Date(y, m - 1, d));
                }
              }}
              style={{
                backgroundColor: bgColor,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                padding: "13px 16px",
                color: textColor,
                fontSize: 15,
                fontFamily: "system-ui, -apple-system, sans-serif",
                width: "100%",
                boxSizing: "border-box",
                outline: "none",
              } as any}
            />
          </View>
          {value ? (
            <View style={{ backgroundColor: bgColor, borderWidth: 1, borderColor, borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" }}>
              <Text style={{ color: textColor, fontSize: 14 }}>{fmt(value)}</Text>
            </View>
          ) : null}
        </View>
        {error ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 6 }}>
        {label}{required ? <Text style={{ color: "#EF4444" }}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={{
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 13,
        }}
      >
        <Text style={{ color: value ? textColor : placeholderColor, fontSize: 15 }}>
          {value ? fmt(value) : "Tap to select date"}
        </Text>
      </Pressable>
      {error ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
      {showPicker ? (
        <DateTimePicker
          value={value ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === "ios");
            if (selected) onChange(selected);
          }}
        />
      ) : null}
    </View>
  );
}
