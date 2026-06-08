import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { type ReactNode } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useTheme } from "@/context/ThemeContext";

interface ScreenLayoutProps {
  children: ReactNode;
  screenIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
}

const isWeb = Platform.OS === "web";

/* ─── Theme toggle ─────────────────────────────────────────── */
function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  if (isWeb) {
    return (
      <Pressable
        onPress={toggle}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(2,132,199,0.12)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(2,132,199,0.25)",
        }}
      >
        <MaterialCommunityIcons
          name={isDark ? "weather-night" : "weather-sunny"}
          size={14}
          color={isDark ? "#38BDF8" : "#0284C7"}
        />
        <Text style={{ color: isDark ? "#8B9FC7" : "#0284C7", fontSize: 11, fontWeight: "600" }}>
          {isDark ? "Dark" : "Light"}
        </Text>
        {/* Mini pill toggle */}
        <View
          style={{
            width: 28,
            height: 16,
            borderRadius: 8,
            backgroundColor: isDark ? "rgba(56,189,248,0.3)" : "#38BDF8",
            justifyContent: "center",
            paddingHorizontal: 2,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#fff",
              transform: [{ translateX: isDark ? 0 : 12 }],
            }}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <MaterialCommunityIcons
        name={isDark ? "weather-night" : "weather-sunny"}
        size={13}
        color={isDark ? "#38BDF8" : "#0284C7"}
      />
      <Switch
        value={!isDark}
        onValueChange={toggle}
        trackColor={{ false: "rgba(56,189,248,0.25)", true: "#38BDF8" }}
        thumbColor="#fff"
        ios_backgroundColor="rgba(56,189,248,0.25)"
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
    </View>
  );
}

/* ─── Header (glass) ───────────────────────────────────────── */
function GlassHeader({
  screenIcon,
  title,
  subtitle,
  rightAction,
  isDark,
}: {
  screenIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  isDark: boolean;
}) {
  const borderColor = isDark ? "rgba(56,189,248,0.18)" : "rgba(2,132,199,0.18)";
  const iconBg      = isDark ? "rgba(56,189,248,0.1)"  : "rgba(2,132,199,0.1)";
  const iconBorder  = isDark ? "rgba(56,189,248,0.3)"  : "rgba(2,132,199,0.3)";
  const titleColor  = isDark ? "#F0F6FF"  : "#071240";
  const subColor    = isDark ? "#8B9FC7"  : "#3D5888";
  const labelColor  = isDark ? "rgba(56,189,248,0.7)" : "rgba(2,132,199,0.7)";
  const headerBg    = isDark ? "rgba(3,7,18,0.82)"    : "rgba(240,247,255,0.88)";

  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        // On native, BlurView provides the background; on web the wrapper div does
        backgroundColor: isWeb ? undefined : headerBg,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: iconBg,
          borderWidth: 1,
          borderColor: iconBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={screenIcon}
          size={24}
          color={isDark ? "#38BDF8" : "#0284C7"}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: labelColor,
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 1.8,
            textTransform: "uppercase",
            marginBottom: 1,
          }}
        >
          Shreshta Motor Training
        </Text>
        <Text style={{ color: titleColor, fontSize: 18, fontWeight: "800", letterSpacing: 0.2 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: subColor, fontSize: 12, marginTop: 1 }}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {rightAction}
        <ThemeToggle />
      </View>
    </View>
  );

  if (isWeb) {
    return (
      <div
        style={{
          backgroundColor: headerBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,          // never let the header compress
        } as any}
      >
        {inner}
      </div>
    );
  }

  // Native: BlurView wraps the header for frosted glass
  return (
    <BlurView
      intensity={50}
      tint={isDark ? "dark" : "light"}
      style={{ flexShrink: 0 }}   // never collapse — height is natural
    >
      {inner}
    </BlurView>
  );
}

/* ─── ScreenLayout ─────────────────────────────────────────── */
export function ScreenLayout({
  children,
  screenIcon,
  title,
  subtitle,
  rightAction,
}: ScreenLayoutProps) {
  const { isDark } = useTheme();

  const watermarkColor = isDark ? "rgba(56,189,248,0.06)" : "rgba(2,132,199,0.08)";
  const footerBorder   = isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.15)";
  const footerBg       = isDark ? "rgba(3,7,18,0.82)"     : "rgba(240,247,255,0.88)";
  const footerText     = isDark ? "rgba(139,159,199,0.6)" : "rgba(61,88,136,0.55)";

  /* ── WEB ───────────────────────────────────────────────────
     Key fix: use height=100vh + overflow=hidden (not minHeight)
     so the flex chain is bounded and ScrollView can scroll.
     Also add minHeight=0 on every flex-1 descendant — CSS flex
     children default to min-height:auto which prevents shrinking.
  ─────────────────────────────────────────────────────────── */
  if (isWeb) {
    return (
      <div
        style={{
          height: "100vh",      // hard bound — not minHeight
          overflow: "hidden",   // clip; browser scroll disabled
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Background — pointer-events:none so it never blocks interaction */}
        <AnimatedBackground />

        {/* Watermark overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <span
            style={{
              color: watermarkColor,
              fontSize: 22,
              fontWeight: "900",
              textAlign: "center",
              transform: "rotate(-12deg)",
              letterSpacing: 2,
              userSelect: "none",
              textTransform: "uppercase",
              lineHeight: 1.6,
              pointerEvents: "none",
            }}
          >
            {"Shreshta Motor\nTraining School"}
          </span>
        </div>

        {/*
          Content column — sits above the fixed background (zIndex:1).
          flex:1 + minHeight:0 lets it shrink to fit the 100vh container
          so that children ScrollViews get a real bounded height.
        */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,         // CSS flex gotcha: allow shrinking
            overflow: "hidden",
          }}
        >
          <GlassHeader
            screenIcon={screenIcon}
            title={title}
            subtitle={subtitle}
            rightAction={rightAction}
            isDark={isDark}
          />

          {/*
            Scrollable content area.
            flex:1 + minHeight:0 + overflow:hidden gives the
            ScrollView inside a real, bounded height to scroll within.
          */}
          <div
            style={{
              flex: 1,
              minHeight: 0,        // CSS flex gotcha: allow shrinking
              display: "flex",     // become a flex container so children can use flex:1
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",  // let the inner ScrollView handle its own overflow
            }}
          >
            {children}
          </div>

          {/* Footer */}
          <div
            style={{
              flexShrink: 0,
              padding: "10px 0",
              textAlign: "center",
              backgroundColor: footerBg,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderTop: `1px solid ${footerBorder}`,
            } as any}
          >
            <span style={{ color: footerText, fontSize: 11 }}>
              © Shreshta Motor Training School
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── NATIVE ────────────────────────────────────────────────
     SafeAreaView (flex:1) → inner View (flex:1) gives the
     ScrollView a hard bounded height = screen minus header/footer.
  ─────────────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Animated background — pointerEvents="none" so touches pass through */}
      <AnimatedBackground />

      {/* Watermark — absolutely positioned, touch-transparent */}
      <View
        pointerEvents="none"
        style={styles.watermark}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          style={{
            color: watermarkColor,
            fontSize: 18,
            fontWeight: "900",
            textAlign: "center",
            transform: [{ rotate: "-12deg" }],
            letterSpacing: 2,
            textTransform: "uppercase",
            lineHeight: 30,
          }}
        >
          {"Shreshta Motor\nTraining School"}
        </Text>
      </View>

      {/* Main column — takes all space, lays out header / scroll area / footer */}
      <View style={styles.column}>
        <GlassHeader
          screenIcon={screenIcon}
          title={title}
          subtitle={subtitle}
          rightAction={rightAction}
          isDark={isDark}
        />

        {/* This View bounds the ScrollView height */}
        <View style={styles.scrollArea}>{children}</View>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              borderTopColor: footerBorder,
              backgroundColor: footerBg,
            },
          ]}
        >
          <Text style={{ color: footerText, fontSize: 11 }}>
            © Shreshta Motor Training School
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  column: {
    flex: 1,
    flexDirection: "column",
  },
  // flex:1 here is what gives the ScrollView a bounded height on native
  scrollArea: {
    flex: 1,
  },
  footer: {
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
  },
});
