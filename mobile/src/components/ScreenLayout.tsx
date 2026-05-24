import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenLayoutProps {
  children: ReactNode;
  /** Unique automobile icon per screen — registration uses car-key */
  screenIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}

/**
 * Shared layout: watermark + per-screen auto icon + dark road theme.
 * Every screen must use this wrapper (per product requirements).
 */
export function ScreenLayout({
  children,
  screenIcon,
  title,
  subtitle,
}: ScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-asphalt-950">
      {/* Watermark layer */}
      <View
        className="absolute inset-0 items-center justify-center pointer-events-none"
        accessibilityElementsHidden
      >
        <Text className="text-accent-road/10 text-lg font-bold text-center px-8 leading-7 rotate-[-12deg]">
          Shreshta Motor Training School
        </Text>
      </View>

      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3 border-b border-asphalt-800">
        <View className="w-12 h-12 rounded-2xl bg-accent-road/15 items-center justify-center border border-accent-road/30">
          <MaterialCommunityIcons name={screenIcon} size={28} color="#38BDF8" />
        </View>
        <View className="flex-1">
          <Text className="text-accent-chrome text-xs uppercase tracking-widest">
            Shreshta Motor Training School
          </Text>
          <Text className="text-white text-xl font-bold">{title}</Text>
          {subtitle ? (
            <Text className="text-gray-400 text-sm mt-0.5">{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View className="flex-1">{children}</View>

      <View className="py-3 items-center border-t border-asphalt-800/80">
        <Text className="text-gray-500 text-xs">© Shreshta Motor Training School</Text>
      </View>
    </SafeAreaView>
  );
}
