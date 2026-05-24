import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

interface FormDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string | null;
  required?: boolean;
  maximumDate?: Date;
}

const isWeb = Platform.OS === "web";

export function FormDatePicker({
  label,
  value,
  onChange,
  error,
  required = false,
  maximumDate = new Date(),
}: FormDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "Tap to select date of birth";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Web implementation using native HTML input
  if (isWeb) {
    return (
      <View className="mb-4">
        <Text className="text-accent-chrome text-sm font-medium mb-1.5">
          {label}
          {required ? <Text className="text-signal-red"> *</Text> : null}
        </Text>
        <View className="flex-row gap-2">
          <View style={{ flex: 1 }}>
            <input
              type="date"
              value={formatDateForInput(value)}
              onChange={(e) => {
                if (e.target.value) {
                  const [year, month, day] = e.target.value.split("-");
                  onChange(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
                }
              }}
              max={formatDateForInput(maximumDate)}
              style={{
                backgroundColor: "#1f2937",
                border: error ? "1px solid #f87171" : "1px solid #374151",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "#ffffff",
                fontSize: "16px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </View>
          {value && (
            <View
              style={{
                backgroundColor: "#1f2937",
                border: error ? "1px solid #f87171" : "1px solid #374151",
                borderRadius: "12px",
                paddingHorizontal: 16,
                paddingVertical: 14,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: "16px" }}>
                {formatDateForDisplay(value)}
              </Text>
            </View>
          )}
        </View>
        {error ? <Text className="text-signal-red text-sm mt-1">{error}</Text> : null}
      </View>
    );
  }

  // Native implementation
  return (
    <View className="mb-4">
      <Text className="text-accent-chrome text-sm font-medium mb-1.5">
        {label}
        {required ? <Text className="text-signal-red"> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        className={`bg-asphalt-800 border rounded-xl px-4 py-3.5 mb-1 ${
          error ? "border-signal-red" : "border-asphalt-700"
        }`}
      >
        <Text className={value ? "text-white text-base" : "text-gray-500 text-base"}>
          {formatDateForDisplay(value)}
        </Text>
      </Pressable>
      {error ? <Text className="text-signal-red text-sm mt-1">{error}</Text> : null}

      {showPicker ? (
        <DateTimePicker
          value={value ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maximumDate}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === "ios");
            if (selected) onChange(selected);
          }}
        />
      ) : null}
    </View>
  );
}
