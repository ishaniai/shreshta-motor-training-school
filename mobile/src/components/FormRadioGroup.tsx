import { Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface RadioOption { label: string; value: boolean; }

interface FormRadioGroupProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  options: RadioOption[];
  error?: string | null;
}

export function FormRadioGroup({ label, value, onChange, options, error }: FormRadioGroupProps) {
  const { isDark } = useTheme();

  const labelColor = isDark ? "#8B9FC7" : "#3D5888";
  const accent = isDark ? "#38BDF8" : "#0284C7";

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: labelColor, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
        {label}<Text style={{ color: "#EF4444" }}> *</Text>
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 13,
                borderRadius: 14,
                borderWidth: 1,
                backgroundColor: selected
                  ? isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.1)"
                  : isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                borderColor: selected
                  ? isDark ? "rgba(56,189,248,0.5)" : "rgba(2,132,199,0.5)"
                  : isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.25)",
                opacity: pressed ? 0.8 : 1,
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: selected ? accent : isDark ? "rgba(139,159,199,0.5)" : "rgba(61,88,136,0.4)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                {selected ? (
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: accent }} />
                ) : null}
              </View>
              <Text
                style={{
                  color: selected ? accent : isDark ? "#8B9FC7" : "#3D5888",
                  fontWeight: selected ? "700" : "500",
                  fontSize: 14,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}
