import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center mb-3 mt-2">
      <View className="h-px flex-1 bg-asphalt-700" />
      <Text className="text-accent-road text-xs font-semibold uppercase mx-3 tracking-wide">
        {title}
      </Text>
      <View className="h-px flex-1 bg-asphalt-700" />
    </View>
  );
}
