import { BlurView } from "expo-blur";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

const isWeb = Platform.OS === "web";

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const { isDark } = useTheme();
  const isDisabled = disabled || loading;

  // Web — use CSS classes for full glassmorphism
  if (isWeb) {
    const cls =
      variant === "primary"
        ? isDark
          ? "glass-btn-primary"
          : "glass-btn-light-primary"
        : "glass-btn-secondary";

    return (
      <div
        role="button"
        onClick={isDisabled ? undefined : onPress}
        className={cls}
        style={{
          flex: 1,
          paddingTop: 14,
          paddingBottom: 14,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          userSelect: "none",
        }}
      >
        {loading ? (
          <div style={{ width: 20, height: 20, border: "2px solid rgba(255,255,255,0.6)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        ) : (
          <span
            style={{
              color:
                variant === "primary"
                  ? isDark
                    ? "#E0F5FF"
                    : "#FFFFFF"
                  : isDark
                  ? "#CBD5E1"
                  : "#334155",
              fontWeight: "700",
              fontSize: 16,
              letterSpacing: "0.03em",
            }}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  // Native — BlurView for glass effect
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 16,
        overflow: "hidden",
        opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1,
        transform: [{ scale: pressed && !isDisabled ? 0.97 : 1 }],
      })}
    >
      <BlurView
        intensity={variant === "primary" ? 40 : 20}
        tint={isDark ? "dark" : "light"}
        style={{
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor:
            variant === "primary"
              ? isDark
                ? "rgba(56,189,248,0.5)"
                : "rgba(2,132,199,0.4)"
              : isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(99,126,210,0.25)",
          backgroundColor:
            variant === "primary"
              ? isDark
                ? "rgba(56,189,248,0.18)"
                : "rgba(2,132,199,0.75)"
              : isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.55)",
          borderRadius: 16,
        }}
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? (isDark ? "#38BDF8" : "#fff") : isDark ? "#CBD5E1" : "#334155"} />
        ) : (
          <Text
            style={{
              color:
                variant === "primary"
                  ? isDark
                    ? "#E0F5FF"
                    : "#FFFFFF"
                  : isDark
                  ? "#CBD5E1"
                  : "#334155",
              fontWeight: "700",
              fontSize: 16,
              letterSpacing: 0.5,
            }}
          >
            {label}
          </Text>
        )}
      </BlurView>
    </Pressable>
  );
}
