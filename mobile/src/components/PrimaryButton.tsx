import { ActivityIndicator, Pressable, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

/** Submit / Clear action buttons */
export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const base = "flex-1 py-3.5 rounded-xl items-center justify-center";
  const variants = {
    primary: "bg-accent-road",
    secondary: "bg-asphalt-700",
    outline: "bg-transparent border border-asphalt-700",
  };
  const textVariants = {
    primary: "text-asphalt-950 font-bold",
    secondary: "text-white font-semibold",
    outline: "text-accent-chrome font-semibold",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled || loading ? "opacity-50" : ""}`}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#0B1220" : "#fff"} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </Pressable>
  );
}
