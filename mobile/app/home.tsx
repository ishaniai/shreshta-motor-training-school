import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { HomeScreen } from "@/screens/HomeScreen";

/**
 * Protected route — second gate.
 * Redirect fires during render (before any content paints),
 * unlike useEffect which fires after the first render commit.
 * By the time this file mounts, _layout has already confirmed
 * isLoading=false, so we only need to check session here.
 */
export default function HomeRoute() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  return <HomeScreen />;
}
