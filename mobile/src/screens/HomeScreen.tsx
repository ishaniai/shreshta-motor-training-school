import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { useAuth } from "@/context/AuthContext";

/**
 * Schedule Training Appointment — home dashboard after login.
 */
export function HomeScreen() {
  const router = useRouter();
  const { user, isLoading, signOut, session } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/login");
    }
  }, [isLoading, session, router]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  if (isLoading || !session) {
    return (
      <View className="flex-1 bg-asphalt-950 items-center justify-center">
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <ScreenLayout
      screenIcon="calendar-clock"
      title="Schedule Training Appointment"
      subtitle={user ? `Hello, ${user.fullName}` : undefined}
    >
      <View className="flex-1 px-5 justify-center">
        <View className="bg-signal-green/10 border border-signal-green/40 rounded-2xl px-5 py-4 mb-6">
          <Text className="text-signal-green text-center text-lg font-semibold leading-6">
            User landed home page successfully !
          </Text>
        </View>

        <View className="bg-asphalt-900 border border-asphalt-700 rounded-2xl px-5 py-4 mb-8">
          <Text className="text-accent-chrome text-center text-base">
            New Features coming soon !
          </Text>
        </View>

        <PrimaryButton label="Logout" onPress={handleLogout} variant="secondary" />
      </View>
    </ScreenLayout>
  );
}
