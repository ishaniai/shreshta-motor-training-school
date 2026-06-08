import { Platform, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  const { isDark } = useTheme();

  const lineColor = isDark ? "rgba(56,189,248,0.2)" : "rgba(2,132,199,0.2)";
  const textColor = isDark ? "#38BDF8" : "#0284C7";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 10 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
      <View
        style={{
          marginHorizontal: 10,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(56,189,248,0.08)" : "rgba(2,132,199,0.08)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(56,189,248,0.2)" : "rgba(2,132,199,0.2)",
        }}
      >
        <Text
          style={{
            color: textColor,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </Text>
      </View>
      <View style={{ flex: 1, height: 1, backgroundColor: lineColor }} />
    </View>
  );
}
