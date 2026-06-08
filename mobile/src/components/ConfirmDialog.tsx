import { BlurView } from "expo-blur";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const { isDark } = useTheme();

  const cardBg = isDark ? "rgba(10,18,40,0.96)" : "rgba(255,255,255,0.97)";
  const cardBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.25)";
  const textPrimary = isDark ? "#F0F6FF" : "#071240";
  const textSecondary = isDark ? "#8B9FC7" : "#3D5888";
  const confirmBg = destructive
    ? isDark ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.1)"
    : isDark ? "rgba(56,189,248,0.18)" : "rgba(2,132,199,0.1)";
  const confirmBorder = destructive ? "rgba(239,68,68,0.5)" : "rgba(56,189,248,0.5)";
  const confirmText = destructive ? "#EF4444" : isDark ? "#38BDF8" : "#0284C7";
  const cancelBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const cancelBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.2)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
        onPress={onCancel}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          {Platform.OS !== "web" ? (
            <BlurView
              intensity={isDark ? 60 : 80}
              tint={isDark ? "dark" : "light"}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: cardBorder,
                width: 320,
              }}
            >
              <DialogContent
                title={title}
                message={message}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                confirmBg={confirmBg}
                confirmBorder={confirmBorder}
                confirmText={confirmText}
                cancelBg={cancelBg}
                cancelBorder={cancelBorder}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            </BlurView>
          ) : (
            <View
              style={{
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: cardBorder,
                backgroundColor: cardBg,
                width: 320,
                ...(Platform.OS === "web"
                  ? ({ backdropFilter: "blur(24px)" } as any)
                  : {}),
              }}
            >
              <DialogContent
                title={title}
                message={message}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                confirmBg={confirmBg}
                confirmBorder={confirmBorder}
                confirmText={confirmText}
                cancelBg={cancelBg}
                cancelBorder={cancelBorder}
                onConfirm={onConfirm}
                onCancel={onCancel}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DialogContent({
  title, message,
  confirmLabel, cancelLabel,
  textPrimary, textSecondary,
  confirmBg, confirmBorder, confirmText,
  cancelBg, cancelBorder,
  onConfirm, onCancel,
}: {
  title: string; message: string;
  confirmLabel: string; cancelLabel: string;
  textPrimary: string; textSecondary: string;
  confirmBg: string; confirmBorder: string; confirmText: string;
  cancelBg: string; cancelBorder: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <View style={{ padding: 24 }}>
      <Text style={{ color: textPrimary, fontSize: 18, fontWeight: "800", marginBottom: 10, textAlign: "center" }}>
        {title}
      </Text>
      <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 24 }}>
        {message}
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
            backgroundColor: cancelBg, borderWidth: 1, borderColor: cancelBorder,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: textSecondary, fontWeight: "700", fontSize: 14 }}>{cancelLabel}</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          style={({ pressed }) => ({
            flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center",
            backgroundColor: confirmBg, borderWidth: 1, borderColor: confirmBorder,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: confirmText, fontWeight: "800", fontSize: 14 }}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
