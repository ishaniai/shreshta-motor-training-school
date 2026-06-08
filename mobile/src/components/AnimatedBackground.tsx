import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const { width: W, height: H } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

/* ─── Web version uses global.css classes ───────────────────── */
function WebBackground({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={isDark ? "animated-bg-dark" : "animated-bg-light"}
      style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Perspective grid */}
      <div className={isDark ? "road-grid-dark" : "road-grid-light"} />

      {/* Ambient glows */}
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="glow-orb-3" />

      {/* Stars (dark mode only) */}
      {isDark && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="star" />
          ))}
        </>
      )}

      {/* Road strip */}
      <div className={isDark ? "road-strip" : "road-strip-light"} />

      {/* Lane markings */}
      <div className={isDark ? "lane-marks" : "lane-marks-light"} />
      <div
        className={isDark ? "lane-marks" : "lane-marks-light"}
        style={{ left: "25%", opacity: 0.35 }}
      />
      <div
        className={isDark ? "lane-marks" : "lane-marks-light"}
        style={{ left: "75%", opacity: 0.35 }}
      />

      {/* Moving cars — inline SVG silhouettes */}
      <div className="car-right">
        <CarSvg isDark={isDark} />
      </div>
      <div className="car-right-2" style={{ opacity: 0.6 }}>
        <CarSvg isDark={isDark} small />
      </div>
      <div className="car-left" style={{ opacity: 0.7 }}>
        <CarSvg isDark={isDark} flipped />
      </div>
      <div className="bike-right">
        <BikeSvg isDark={isDark} />
      </div>
      <div className="bike-right-2" style={{ opacity: 0.65 }}>
        <BikeSvg isDark={isDark} small />
      </div>

      {/* Bottom gradient fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: isDark
            ? "linear-gradient(to top, rgba(3,7,18,0.95), transparent)"
            : "linear-gradient(to top, rgba(238,244,255,0.95), transparent)",
        }}
      />
      {/* Top gradient fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "20%",
          background: isDark
            ? "linear-gradient(to bottom, rgba(3,7,18,0.8), transparent)"
            : "linear-gradient(to bottom, rgba(238,244,255,0.8), transparent)",
        }}
      />
    </div>
  );
}

function CarSvg({
  isDark,
  flipped = false,
  small = false,
}: {
  isDark: boolean;
  flipped?: boolean;
  small?: boolean;
}) {
  const scale = small ? 0.65 : 1;
  const color = isDark ? "#38BDF8" : "#0284C7";
  const bodyColor = isDark ? "rgba(56,189,248,0.18)" : "rgba(2,132,199,0.15)";
  const glassColor = isDark ? "rgba(56,189,248,0.4)" : "rgba(2,132,199,0.35)";

  return (
    <svg
      width={180 * scale}
      height={60 * scale}
      viewBox="0 0 180 60"
      style={{ transform: flipped ? "scaleX(-1)" : undefined, display: "block" }}
    >
      {/* Car body */}
      <ellipse cx="90" cy="42" rx="78" ry="14" fill={bodyColor} />
      <path
        d="M20 42 Q22 28 50 20 Q65 14 90 13 Q115 14 130 20 Q158 28 160 42 Z"
        fill={bodyColor}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      {/* Windshield */}
      <path
        d="M55 20 Q68 10 90 9 Q112 10 125 20 Q110 22 90 22 Q70 22 55 20 Z"
        fill={glassColor}
      />
      {/* Wheels */}
      <circle cx="45" cy="44" r="10" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="45" cy="44" r="4"  fill={color} fillOpacity="0.3" />
      <circle cx="135" cy="44" r="10" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="135" cy="44" r="4"  fill={color} fillOpacity="0.3" />
      {/* Headlights */}
      <ellipse cx="158" cy="36" rx="6" ry="3" fill={color} fillOpacity="0.9" />
      <ellipse cx="22"  cy="36" rx="6" ry="3" fill="rgba(239,68,68,0.8)" />
      {/* Headlight beam */}
      <path
        d="M163 36 L195 30 L195 42 Z"
        fill={color}
        fillOpacity="0.08"
      />
    </svg>
  );
}

function BikeSvg({
  isDark,
  small = false,
}: {
  isDark: boolean;
  small?: boolean;
}) {
  const scale = small ? 0.7 : 1;
  const color = isDark ? "#F59E0B" : "#D97706";
  const bodyColor = isDark ? "rgba(245,158,11,0.2)" : "rgba(217,119,6,0.15)";

  return (
    <svg
      width={110 * scale}
      height={52 * scale}
      viewBox="0 0 110 52"
      style={{ display: "block" }}
    >
      {/* Rear wheel */}
      <circle cx="22" cy="38" r="12" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.75" />
      <circle cx="22" cy="38" r="5"  fill={color} fillOpacity="0.3" />
      {/* Front wheel */}
      <circle cx="86" cy="38" r="12" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.75" />
      <circle cx="86" cy="38" r="5"  fill={color} fillOpacity="0.3" />
      {/* Frame */}
      <path d="M22 38 L50 18 L74 18 L86 38" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.7" />
      <path d="M50 18 L50 30 L22 38" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Tank/body */}
      <ellipse cx="60" cy="22" rx="18" ry="7" fill={bodyColor} stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      {/* Rider silhouette */}
      <ellipse cx="52" cy="15" rx="7" ry="5" fill={bodyColor} stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      {/* Headlight */}
      <ellipse cx="98" cy="34" rx="5" ry="3" fill={color} fillOpacity="0.95" />
      <path d="M102 34 L120 28 L120 40 Z" fill={color} fillOpacity="0.08" />
      {/* Taillight */}
      <ellipse cx="12" cy="38" rx="4" ry="2" fill="rgba(239,68,68,0.85)" />
    </svg>
  );
}

/* ─── Native version (Reanimated/Animated) ──────────────────── */
function NativeBackground({ isDark }: { isDark: boolean }) {
  const lane1 = useRef(new Animated.Value(0)).current;
  const lane2 = useRef(new Animated.Value(-60)).current;
  const glow1 = useRef(new Animated.Value(0)).current;
  const glow2 = useRef(new Animated.Value(0)).current;
  const car1X = useRef(new Animated.Value(-200)).current;
  const car2X = useRef(new Animated.Value(-150)).current;
  const bikeX = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    // Lane dash animation
    const laneLoop = (anim: Animated.Value) =>
      Animated.loop(
        Animated.timing(anim, { toValue: 120, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      );
    laneLoop(lane1).start();
    laneLoop(lane2).start();

    // Glow pulse
    const glowLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      );
    glowLoop(glow1, 0).start();
    glowLoop(glow2, 1500).start();

    // Car animations
    const carLoop = (anim: Animated.Value, duration: number, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: W + 250, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -250, duration: 0, useNativeDriver: true }),
        ])
      );
    carLoop(car1X, 7000, 0).start();
    carLoop(car2X, 11000, 4000).start();
    carLoop(bikeX, 5000, 2000).start();
  }, []);

  const bg = isDark ? "#030712" : "#EEF4FF";
  const accent = isDark ? "rgba(56,189,248," : "rgba(2,132,199,";
  const gold = "rgba(245,158,11,";

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: bg, overflow: "hidden" }]}>
      {/* Ambient glow orbs */}
      <Animated.View
        style={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: 175,
          top: -80,
          left: -80,
          backgroundColor: isDark ? "rgba(56,189,248,0.08)" : "rgba(2,132,199,0.06)",
          opacity: glow1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: 130,
          bottom: 100,
          right: -60,
          backgroundColor: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.05)",
          opacity: glow2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.9] }),
        }}
      />

      {/* Perspective grid lines — horizontal */}
      {[0.3, 0.42, 0.52, 0.6, 0.67, 0.73].map((frac, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: H * frac,
            height: 1,
            backgroundColor: isDark
              ? `rgba(56,189,248,${0.04 + i * 0.015})`
              : `rgba(2,132,199,${0.06 + i * 0.015})`,
          }}
        />
      ))}

      {/* Perspective grid lines — vertical converging */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((offset, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: H * 0.3,
            bottom: 0,
            left: W / 2 + W * offset - 0.5,
            width: 1,
            backgroundColor: isDark
              ? "rgba(56,189,248,0.08)"
              : "rgba(2,132,199,0.08)",
          }}
        />
      ))}

      {/* Road strip */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: H * 0.4,
          backgroundColor: isDark ? "rgba(5,10,25,0.7)" : "rgba(200,220,255,0.25)",
        }}
      />

      {/* Lane dashes — center */}
      <Animated.View
        style={{
          position: "absolute",
          left: W / 2 - 3,
          top: 0,
          bottom: 0,
          width: 6,
          transform: [{ translateY: lane1 }],
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={{
              height: 40,
              marginBottom: 40,
              backgroundColor: isDark ? "rgba(56,189,248,0.5)" : "rgba(2,132,199,0.4)",
              borderRadius: 3,
            }}
          />
        ))}
      </Animated.View>

      {/* Moving car 1 */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: H * 0.2,
          transform: [{ translateX: car1X }],
        }}
      >
        <NativeCarShape isDark={isDark} />
      </Animated.View>

      {/* Moving car 2 (smaller) */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: H * 0.15,
          opacity: 0.6,
          transform: [{ translateX: car2X }, { scale: 0.7 }],
        }}
      >
        <NativeCarShape isDark={isDark} />
      </Animated.View>

      {/* Moving bike */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: H * 0.12,
          transform: [{ translateX: bikeX }],
        }}
      >
        <NativeBikeShape isDark={isDark} />
      </Animated.View>

      {/* Bottom + top gradient overlays */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: H * 0.25,
          backgroundColor: isDark ? "rgba(3,7,18,0.9)" : "rgba(238,244,255,0.85)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: H * 0.15,
          backgroundColor: isDark ? "rgba(3,7,18,0.7)" : "rgba(238,244,255,0.7)",
        }}
      />
    </View>
  );
}

function NativeCarShape({ isDark }: { isDark: boolean }) {
  const color = isDark ? "rgba(56,189,248,0.7)" : "rgba(2,132,199,0.65)";
  const body = isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.12)";
  return (
    <View style={{ width: 140, height: 44 }}>
      {/* Body */}
      <View style={{ position: "absolute", bottom: 8, left: 10, right: 10, height: 22, backgroundColor: body, borderRadius: 8, borderWidth: 1, borderColor: color }} />
      {/* Roof */}
      <View style={{ position: "absolute", bottom: 22, left: 35, right: 35, height: 16, backgroundColor: body, borderRadius: 6, borderWidth: 1, borderColor: color }} />
      {/* Wheels */}
      <View style={{ position: "absolute", bottom: 0, left: 20, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color }} />
      <View style={{ position: "absolute", bottom: 0, right: 20, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: color }} />
      {/* Headlight */}
      <View style={{ position: "absolute", bottom: 14, right: 6, width: 8, height: 5, borderRadius: 2, backgroundColor: isDark ? "rgba(56,189,248,0.9)" : "rgba(2,132,199,0.9)" }} />
    </View>
  );
}

function NativeBikeShape({ isDark }: { isDark: boolean }) {
  const color = isDark ? "rgba(245,158,11,0.75)" : "rgba(217,119,6,0.65)";
  return (
    <View style={{ width: 80, height: 38 }}>
      <View style={{ position: "absolute", bottom: 0, left: 5, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color }} />
      <View style={{ position: "absolute", bottom: 0, right: 5, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: color }} />
      <View style={{ position: "absolute", bottom: 10, left: 16, right: 16, height: 14, backgroundColor: isDark ? "rgba(245,158,11,0.2)" : "rgba(217,119,6,0.15)", borderRadius: 5, borderWidth: 1, borderColor: color }} />
      <View style={{ position: "absolute", bottom: 22, left: 28, width: 24, height: 12, backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "rgba(217,119,6,0.12)", borderRadius: 4, borderWidth: 1, borderColor: color }} />
    </View>
  );
}

export function AnimatedBackground() {
  const { isDark } = useTheme();
  if (isWeb) return <WebBackground isDark={isDark} />;
  return <NativeBackground isDark={isDark} />;
}
