import { Pressable, Text, View } from "react-native";

interface RadioOption {
  label: string;
  value: boolean;
}

interface FormRadioGroupProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  options: RadioOption[];
  error?: string | null;
}

/** Yes / No radio group for driving license question */
export function FormRadioGroup({
  label,
  value,
  onChange,
  options,
  error,
}: FormRadioGroupProps) {
  return (
    <View className="mb-4">
      <Text className="text-accent-chrome text-sm font-medium mb-2">
        {label}
        <Text className="text-signal-red"> *</Text>
      </Text>
      <View className="flex-row gap-3">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.label}
              onPress={() => onChange(opt.value)}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl border ${
                selected
                  ? "bg-accent-road/20 border-accent-road"
                  : "bg-asphalt-800 border-asphalt-700"
              }`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                className={`w-4 h-4 rounded-full border-2 mr-2 items-center justify-center ${
                  selected ? "border-accent-road" : "border-gray-500"
                }`}
              >
                {selected ? (
                  <View className="w-2 h-2 rounded-full bg-accent-road" />
                ) : null}
              </View>
              <Text className="text-white font-medium">{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text className="text-signal-red text-sm mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
