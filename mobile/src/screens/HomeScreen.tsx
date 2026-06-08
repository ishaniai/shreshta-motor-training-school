import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenLayout } from "@/components/ScreenLayout";
import { SectionHeader } from "@/components/SectionHeader";
import { ValidationMessage } from "@/components/ValidationMessage";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  type Appointment,
  ApiError,
  bookAppointment,
  cancelAppointment as apiCancelAppointment,
  formatDateForApi,
  getMyAppointments,
  rescheduleAppointment as apiRescheduleAppointment,
} from "@/services/api";

const TIME_SLOTS = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
] as const;

type VehicleType = "2-wheeler" | "4-wheeler";
type Tab = "book" | "appointments";
const isWeb = Platform.OS === "web";

function tomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDisplay(d: Date | null) {
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function isActive(apt: Appointment): boolean {
  if (apt.status === "cancelled") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDateLocal(apt.date) >= today;
}

function vehicleLabel(type: "2-wheeler" | "4-wheeler") {
  return type === "2-wheeler" ? "2 Wheeler" : "4 Wheeler";
}

function LogoutLink({ onPress, isDark }: { onPress: () => void; isDark: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Text style={{ color: isDark ? "#38BDF8" : "#0284C7", fontSize: 12, fontWeight: "700", textDecorationLine: "underline" }}>
        Logout
      </Text>
    </Pressable>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { user, signOut, session } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<Tab>("book");

  /* ── Book Appointment state ─────────────────────────── */
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState<string | null>(null);
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  /* ── My Appointments state ──────────────────────────── */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [aptsError, setAptsError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancel
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Reschedule
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null);
  const [rescheduleErrors, setRescheduleErrors] = useState<Record<string, string>>({});
  const [rescheduling, setRescheduling] = useState(false);
  const [showReschedulePicker, setShowReschedulePicker] = useState(false);

  const minDate = tomorrow();

  /* ── Load appointments ──────────────────────────────── */
  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (!session?.token) return;
    if (isRefresh) setRefreshing(true);
    else setLoadingApts(true);
    setAptsError(null);
    try {
      const apts = await getMyAppointments(session.token);
      setAppointments(apts);
    } catch (e) {
      setAptsError(e instanceof ApiError ? e.message : "Failed to load appointments.");
    } finally {
      setLoadingApts(false);
      setRefreshing(false);
    }
  }, [session?.token]);

  useEffect(() => {
    if (activeTab === "appointments") loadAppointments();
  }, [activeTab, loadAppointments]);

  const flashSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4500);
  }, []);

  const handleLogout = async () => { await signOut(); router.replace("/login"); };

  /* ── Book handlers ──────────────────────────────────── */
  const clearBookErr = (k: string) =>
    setBookErrors((p) => { const n = { ...p }; delete n[k]; return n; });

  const validateBook = () => {
    const n: Record<string, string> = {};
    if (!vehicleType) n.vehicleType = "Please select a vehicle type";
    if (!selectedDate) n.date = "Please select a training date";
    if (!timeSlot) n.timeSlot = "Please select a time slot";
    setBookErrors(n);
    return Object.keys(n).length === 0;
  };

  const handleBookReset = () => {
    setVehicleType(null); setSelectedDate(null); setTimeSlot(null);
    setBookErrors({}); setBooked(false);
  };

  const handleBookSubmit = async () => {
    if (!validateBook() || !session?.token) return;
    setSubmitting(true); setBookErrors({});
    try {
      await bookAppointment(
        { vehicleType: vehicleType!, date: formatDateForApi(selectedDate!), timeSlot: timeSlot! },
        session.token
      );
      setBooked(true);
    } catch (e) {
      setBookErrors({ submit: e instanceof ApiError ? e.message : "Failed to book. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Cancel handlers ────────────────────────────────── */
  const handleCancelConfirm = async () => {
    if (!cancelDialogId || !session?.token) return;
    setCancelling(true);
    try {
      await apiCancelAppointment(cancelDialogId, session.token);
      setAppointments((prev) =>
        prev.map((a) => a.id === cancelDialogId ? { ...a, status: "cancelled" as const } : a)
      );
      setCancelDialogId(null);
      flashSuccess("Appointment cancelled. Admin has been notified.");
    } catch (e) {
      setCancelDialogId(null);
      setAptsError(e instanceof ApiError ? e.message : "Failed to cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  /* ── Reschedule handlers ────────────────────────────── */
  const openReschedule = (apt: Appointment) => {
    setReschedulingId(apt.id);
    setRescheduleDate(parseDateLocal(apt.date));
    setRescheduleSlot(apt.time_slot);
    setRescheduleErrors({});
    setShowReschedulePicker(false);
  };

  const closeReschedule = () => {
    setReschedulingId(null);
    setRescheduleDate(null);
    setRescheduleSlot(null);
    setRescheduleErrors({});
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingId || !session?.token) return;
    const errs: Record<string, string> = {};
    if (!rescheduleDate) errs.date = "Please select a new date";
    if (!rescheduleSlot) errs.timeSlot = "Please select a time slot";
    if (rescheduleDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (rescheduleDate <= today) errs.date = "New date must be at least 1 day in the future";
    }
    if (Object.keys(errs).length) { setRescheduleErrors(errs); return; }

    setRescheduling(true); setRescheduleErrors({});
    try {
      const res = await apiRescheduleAppointment(
        reschedulingId,
        { date: formatDateForApi(rescheduleDate!), timeSlot: rescheduleSlot! },
        session.token
      );
      if (res.appointment) {
        setAppointments((prev) =>
          prev.map((a) => a.id === reschedulingId ? res.appointment! : a)
        );
      }
      closeReschedule();
      flashSuccess("Appointment rescheduled. Admin has been notified.");
    } catch (e) {
      setRescheduleErrors({ submit: e instanceof ApiError ? e.message : "Failed to reschedule." });
    } finally {
      setRescheduling(false);
    }
  };

  if (!session) return null;

  /* ── Theme tokens ───────────────────────────────────── */
  const accent = isDark ? "#38BDF8" : "#0284C7";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(99,126,210,0.2)";
  const textPrimary = isDark ? "#F0F6FF" : "#071240";
  const textSecondary = isDark ? "#8B9FC7" : "#3D5888";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)";

  const activeApts = appointments.filter(isActive);
  const pastApts = appointments.filter((a) => !isActive(a));

  /* ── Shared: tab bar ────────────────────────────────── */
  const tabBar = (
    <View style={{
      flexDirection: "row", marginHorizontal: 20, marginBottom: 8,
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
      borderRadius: 14, padding: 4, borderWidth: 1, borderColor: cardBorder,
    }}>
      {(["book", "appointments"] as Tab[]).map((tab) => {
        const sel = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center",
              backgroundColor: sel
                ? (isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.12)")
                : "transparent",
              borderWidth: sel ? 1 : 0,
              borderColor: sel ? (isDark ? "rgba(56,189,248,0.4)" : "rgba(2,132,199,0.35)") : "transparent",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <MaterialCommunityIcons
              name={tab === "book" ? "calendar-plus" : "calendar-check"}
              size={14}
              color={sel ? accent : textSecondary}
              style={{ marginBottom: 2 }}
            />
            <Text style={{ fontSize: 12, fontWeight: sel ? "800" : "500", color: sel ? accent : textSecondary }}>
              {tab === "book" ? "Book Appointment" : "My Appointments"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  /* ══════════════════════════════════════════════════════
     BOOK APPOINTMENT — Success state
  ══════════════════════════════════════════════════════ */
  if (booked) {
    return (
      <ScreenLayout
        screenIcon="calendar-check"
        title="Appointment Booked"
        rightAction={<LogoutLink onPress={handleLogout} isDark={isDark} />}
      >
        {tabBar}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: "center" }}>
          <View style={{
            backgroundColor: isDark ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.12)",
            borderWidth: 1, borderColor: "rgba(52,211,153,0.35)",
            borderRadius: 20, padding: 28, alignItems: "center", marginBottom: 20,
          }}>
            <MaterialCommunityIcons name="check-circle-outline" size={60} color="#34D399" />
            <Text style={{ color: "#34D399", fontSize: 22, fontWeight: "800", marginTop: 16, marginBottom: 8, textAlign: "center" }}>
              Appointment Confirmed!
            </Text>
            <Text style={{ color: textSecondary, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
              Your training slot is locked in.{"\n"}Admin has been notified via email & WhatsApp.
            </Text>
          </View>

          <View style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, borderRadius: 20, padding: 20, marginBottom: 24 }}>
            {([
              ["Vehicle Type", vehicleLabel(vehicleType!)],
              ["Training Date", fmtDisplay(selectedDate)],
              ["Time Slot", timeSlot ?? ""],
            ] as [string, string][]).map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ color: textSecondary, fontSize: 13 }}>{k}</Text>
                <Text style={{ color: textPrimary, fontSize: 13, fontWeight: "700" }}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <PrimaryButton label="Book Another" onPress={handleBookReset} variant="outline" />
            <PrimaryButton label="My Appointments" onPress={() => { handleBookReset(); setActiveTab("appointments"); }} />
          </View>
        </ScrollView>
      </ScreenLayout>
    );
  }

  /* ══════════════════════════════════════════════════════
     BOOK APPOINTMENT — Form
  ══════════════════════════════════════════════════════ */
  const bookTab = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Vehicle Type */}
      <SectionHeader title="Vehicle Type" />
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 4 }}>
        {(["2-wheeler", "4-wheeler"] as VehicleType[]).map((type) => {
          const sel = vehicleType === type;
          return (
            <Pressable
              key={type}
              onPress={() => { setVehicleType(type); clearBookErr("vehicleType"); }}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 20, borderRadius: 18, alignItems: "center",
                borderWidth: 1,
                backgroundColor: sel ? (isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.1)") : cardBg,
                borderColor: sel ? (isDark ? "rgba(56,189,248,0.55)" : "rgba(2,132,199,0.5)") : cardBorder,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: sel ? 1.02 : 1 }],
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
            >
              <MaterialCommunityIcons name={type === "2-wheeler" ? "motorbike" : "car-side"} size={38} color={sel ? accent : (isDark ? "#4B6A96" : "#7B9CBF")} />
              <Text style={{ marginTop: 8, color: sel ? accent : textSecondary, fontWeight: "700", fontSize: 15 }}>
                {vehicleLabel(type)}
              </Text>
              {sel && <View style={{ marginTop: 6, width: 24, height: 3, borderRadius: 2, backgroundColor: accent }} />}
            </Pressable>
          );
        })}
      </View>
      <ValidationMessage message={bookErrors.vehicleType ?? null} />

      {/* Training Date */}
      <SectionHeader title="Training Date" />
      {isWeb ? (
        <View style={{ marginBottom: 4 }}>
          <input
            type="date"
            min={formatDateForApi(minDate)}
            value={selectedDate ? formatDateForApi(selectedDate) : ""}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split("-").map(Number);
                setSelectedDate(new Date(y, m - 1, d));
                clearBookErr("date");
              }
            }}
            style={{
              backgroundColor: inputBg,
              backdropFilter: "blur(12px)",
              border: `1px solid ${bookErrors.date ? "rgba(239,68,68,0.7)" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.3)")}`,
              borderRadius: 14, padding: "13px 16px",
              color: isDark ? "#F0F6FF" : "#071240",
              fontSize: 15, fontFamily: "system-ui", width: "100%",
              boxSizing: "border-box", outline: "none",
            } as any}
          />
          {selectedDate && <Text style={{ color: textSecondary, fontSize: 12, marginTop: 4 }}>{fmtDisplay(selectedDate)}</Text>}
        </View>
      ) : (
        <View style={{ marginBottom: 4 }}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: bookErrors.date ? "rgba(239,68,68,0.7)" : cardBorder, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 }}
          >
            <Text style={{ color: selectedDate ? textPrimary : textSecondary, fontSize: 15 }}>
              {selectedDate ? fmtDisplay(selectedDate) : "Tap to select training date"}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate ?? minDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={minDate}
              onChange={(_, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) { setSelectedDate(date); clearBookErr("date"); }
              }}
            />
          )}
        </View>
      )}
      <ValidationMessage message={bookErrors.date ?? null} />

      {/* Time Slot */}
      <SectionHeader title="Time Slot" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        {TIME_SLOTS.map((slot) => {
          const sel = timeSlot === slot;
          return (
            <Pressable
              key={slot}
              onPress={() => { setTimeSlot(slot); clearBookErr("timeSlot"); }}
              style={({ pressed }) => ({
                paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1,
                minWidth: "30%", alignItems: "center",
                backgroundColor: sel ? (isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.1)") : cardBg,
                borderColor: sel ? (isDark ? "rgba(56,189,248,0.5)" : "rgba(2,132,199,0.45)") : cardBorder,
                opacity: pressed ? 0.8 : 1,
              })}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: sel ? accent : textSecondary, textAlign: "center" }}>
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ValidationMessage message={bookErrors.timeSlot ?? null} />

      {bookErrors.submit && <View style={{ marginTop: 8 }}><ValidationMessage message={bookErrors.submit} /></View>}

      <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 32 }}>
        <PrimaryButton label="Reset" onPress={handleBookReset} variant="outline" />
        <PrimaryButton label="Submit" onPress={handleBookSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );

  /* ══════════════════════════════════════════════════════
     MY APPOINTMENTS TAB
  ══════════════════════════════════════════════════════ */
  const aptTab = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadAppointments(true)}
          tintColor={accent}
          colors={[accent]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Success banner */}
      {successMsg && (
        <View style={{
          backgroundColor: isDark ? "rgba(52,211,153,0.12)" : "rgba(52,211,153,0.15)",
          borderWidth: 1, borderColor: "rgba(52,211,153,0.4)",
          borderRadius: 14, padding: 14, marginBottom: 16,
          flexDirection: "row", alignItems: "center", gap: 10,
        }}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#34D399" />
          <Text style={{ color: "#34D399", fontWeight: "700", fontSize: 13, flex: 1 }}>{successMsg}</Text>
        </View>
      )}

      {/* Error banner */}
      {aptsError && (
        <View style={{
          backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)",
          borderWidth: 1, borderColor: "rgba(239,68,68,0.35)",
          borderRadius: 14, padding: 14, marginBottom: 16,
          flexDirection: "row", alignItems: "center", gap: 10,
        }}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
          <Text style={{ color: "#EF4444", fontWeight: "600", fontSize: 13, flex: 1 }}>{aptsError}</Text>
        </View>
      )}

      {/* Loading */}
      {loadingApts && (
        <View style={{ alignItems: "center", paddingVertical: 48 }}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 14 }}>Loading appointments…</Text>
        </View>
      )}

      {!loadingApts && (
        <>
          {/* ── Active Appointments ── */}
          <SectionHeader title={`Active Appointments (${activeApts.length})`} />
          {activeApts.length === 0 ? (
            <View style={{
              backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder,
              borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 8,
            }}>
              <MaterialCommunityIcons name="calendar-blank" size={36} color={isDark ? "#4B6A96" : "#A3B8D4"} />
              <Text style={{ color: textSecondary, fontSize: 14, marginTop: 10, textAlign: "center" }}>
                No active appointments.{"\n"}Book one using the "Book Appointment" tab.
              </Text>
            </View>
          ) : (
            activeApts.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                isDark={isDark}
                accent={accent}
                cardBg={cardBg}
                cardBorder={cardBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputBg={inputBg}
                isRescheduling={reschedulingId === apt.id}
                rescheduleDate={reschedulingId === apt.id ? rescheduleDate : null}
                rescheduleSlot={reschedulingId === apt.id ? rescheduleSlot : null}
                rescheduleErrors={reschedulingId === apt.id ? rescheduleErrors : {}}
                rescheduling={rescheduling}
                showReschedulePicker={showReschedulePicker}
                minDate={minDate}
                onRescheduleOpen={() => openReschedule(apt)}
                onRescheduleClose={closeReschedule}
                onRescheduleDateChange={(d) => { setRescheduleDate(d); setRescheduleErrors((p) => { const n = { ...p }; delete n.date; return n; }); }}
                onRescheduleSlotChange={(s) => { setRescheduleSlot(s); setRescheduleErrors((p) => { const n = { ...p }; delete n.timeSlot; return n; }); }}
                onRescheduleSubmit={handleRescheduleSubmit}
                onShowReschedulePicker={setShowReschedulePicker}
                onCancelRequest={() => setCancelDialogId(apt.id)}
              />
            ))
          )}

          {/* ── Past Appointments ── */}
          <SectionHeader title={`Past Appointments (${pastApts.length})`} />
          {pastApts.length === 0 ? (
            <View style={{
              backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder,
              borderRadius: 16, padding: 24, alignItems: "center",
            }}>
              <MaterialCommunityIcons name="calendar-remove" size={36} color={isDark ? "#4B6A96" : "#A3B8D4"} />
              <Text style={{ color: textSecondary, fontSize: 14, marginTop: 10, textAlign: "center" }}>
                No past appointments yet.
              </Text>
            </View>
          ) : (
            pastApts.map((apt) => (
              <AppointmentCard
                key={apt.id}
                apt={apt}
                isDark={isDark}
                accent={accent}
                cardBg={cardBg}
                cardBorder={cardBorder}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                inputBg={inputBg}
                isRescheduling={false}
                rescheduleDate={null}
                rescheduleSlot={null}
                rescheduleErrors={{}}
                rescheduling={false}
                showReschedulePicker={false}
                minDate={minDate}
                onRescheduleOpen={() => {}}
                onRescheduleClose={() => {}}
                onRescheduleDateChange={() => {}}
                onRescheduleSlotChange={() => {}}
                onRescheduleSubmit={async () => {}}
                onShowReschedulePicker={() => {}}
                onCancelRequest={() => {}}
                readonly
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );

  /* ── Main render ───────────────────────────────────── */
  return (
    <ScreenLayout
      screenIcon="calendar-clock"
      title="Training Portal"
      subtitle={user ? `Hello, ${user.fullName}` : undefined}
      rightAction={<LogoutLink onPress={handleLogout} isDark={isDark} />}
    >
      {tabBar}
      {activeTab === "book" ? bookTab : aptTab}

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        visible={cancelDialogId !== null}
        title="Cancel Appointment?"
        message="This will cancel your training slot. Admin will be notified. This action cannot be undone."
        confirmLabel={cancelling ? "Cancelling…" : "Yes, Cancel"}
        cancelLabel="Keep it"
        destructive
        onConfirm={handleCancelConfirm}
        onCancel={() => { if (!cancelling) setCancelDialogId(null); }}
      />
    </ScreenLayout>
  );
}

/* ══════════════════════════════════════════════════════
   APPOINTMENT CARD
══════════════════════════════════════════════════════ */
interface CardProps {
  apt: Appointment;
  isDark: boolean;
  accent: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  isRescheduling: boolean;
  rescheduleDate: Date | null;
  rescheduleSlot: string | null;
  rescheduleErrors: Record<string, string>;
  rescheduling: boolean;
  showReschedulePicker: boolean;
  minDate: Date;
  onRescheduleOpen: () => void;
  onRescheduleClose: () => void;
  onRescheduleDateChange: (d: Date) => void;
  onRescheduleSlotChange: (s: string) => void;
  onRescheduleSubmit: () => void;
  onShowReschedulePicker: (v: boolean) => void;
  onCancelRequest: () => void;
  readonly?: boolean;
}

function AppointmentCard({
  apt, isDark, accent, cardBg, cardBorder, textPrimary, textSecondary, inputBg,
  isRescheduling, rescheduleDate, rescheduleSlot, rescheduleErrors, rescheduling,
  showReschedulePicker, minDate,
  onRescheduleOpen, onRescheduleClose, onRescheduleDateChange, onRescheduleSlotChange,
  onRescheduleSubmit, onShowReschedulePicker, onCancelRequest,
  readonly = false,
}: CardProps) {
  const isCancelled = apt.status === "cancelled";
  const aptDate = parseDateLocal(apt.date);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isPast = !isCancelled && aptDate < today;

  const statusColor = isCancelled ? "#EF4444" : isPast ? (isDark ? "#8B9FC7" : "#6B84AA") : "#34D399";
  const statusLabel = isCancelled ? "Cancelled" : isPast ? "Completed" : "Confirmed";
  const statusBg = isCancelled
    ? "rgba(239,68,68,0.1)"
    : isPast
    ? (isDark ? "rgba(139,159,199,0.1)" : "rgba(107,132,170,0.1)")
    : "rgba(52,211,153,0.1)";

  const fmtDateStr = fmtDisplay(aptDate);

  return (
    <View style={{
      backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder,
      borderRadius: 18, marginBottom: 12, overflow: "hidden",
    }}>
      {/* Card header */}
      <View style={{ padding: 16, paddingBottom: isRescheduling ? 12 : 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View style={{
              width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center",
              backgroundColor: isDark ? "rgba(56,189,248,0.1)" : "rgba(2,132,199,0.08)",
              borderWidth: 1, borderColor: isDark ? "rgba(56,189,248,0.2)" : "rgba(2,132,199,0.15)",
            }}>
              <MaterialCommunityIcons
                name={apt.vehicle_type === "2-wheeler" ? "motorbike" : "car-side"}
                size={22}
                color={accent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 15, marginBottom: 2 }}>
                {vehicleLabel(apt.vehicle_type)}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 12 }}>{fmtDateStr}</Text>
              <Text style={{ color: textSecondary, fontSize: 12 }}>{apt.time_slot}</Text>
            </View>
          </View>
          <View style={{
            backgroundColor: statusBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
            borderWidth: 1, borderColor: statusColor + "40",
          }}>
            <Text style={{ color: statusColor, fontSize: 11, fontWeight: "800" }}>{statusLabel}</Text>
          </View>
        </View>

        {/* Action buttons for active appointments */}
        {!readonly && !isCancelled && !isPast && !isRescheduling && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable
              onPress={onRescheduleOpen}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 6,
                backgroundColor: isDark ? "rgba(56,189,248,0.1)" : "rgba(2,132,199,0.08)",
                borderWidth: 1, borderColor: isDark ? "rgba(56,189,248,0.3)" : "rgba(2,132,199,0.25)",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons name="calendar-edit" size={15} color={accent} />
              <Text style={{ color: accent, fontWeight: "700", fontSize: 13 }}>Reschedule</Text>
            </Pressable>
            <Pressable
              onPress={onCancelRequest}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 6,
                backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.07)",
                borderWidth: 1, borderColor: "rgba(239,68,68,0.3)",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons name="calendar-remove" size={15} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 13 }}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Inline Reschedule Panel ── */}
      {isRescheduling && (
        <View style={{
          borderTopWidth: 1, borderTopColor: cardBorder,
          backgroundColor: isDark ? "rgba(56,189,248,0.04)" : "rgba(2,132,199,0.03)",
          padding: 16,
        }}>
          <Text style={{ color: accent, fontWeight: "800", fontSize: 13, marginBottom: 12 }}>
            Select New Date & Time
          </Text>

          {/* Date picker */}
          {isWeb ? (
            <View style={{ marginBottom: 4 }}>
              <input
                type="date"
                min={formatDateForApi(minDate)}
                value={rescheduleDate ? formatDateForApi(rescheduleDate) : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    onRescheduleDateChange(new Date(y, m - 1, d));
                  }
                }}
                style={{
                  backgroundColor: inputBg,
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${rescheduleErrors.date ? "rgba(239,68,68,0.7)" : (isDark ? "rgba(255,255,255,0.12)" : "rgba(99,126,210,0.3)")}`,
                  borderRadius: 12, padding: "10px 14px",
                  color: isDark ? "#F0F6FF" : "#071240",
                  fontSize: 14, fontFamily: "system-ui",
                  width: "100%", boxSizing: "border-box", outline: "none",
                } as any}
              />
            </View>
          ) : (
            <View style={{ marginBottom: 4 }}>
              <Pressable
                onPress={() => onShowReschedulePicker(true)}
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.72)",
                  borderWidth: 1,
                  borderColor: rescheduleErrors.date ? "rgba(239,68,68,0.7)" : cardBorder,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
                }}
              >
                <Text style={{ color: rescheduleDate ? textPrimary : textSecondary, fontSize: 14 }}>
                  {rescheduleDate ? fmtDisplay(rescheduleDate) : "Tap to select new date"}
                </Text>
              </Pressable>
              {showReschedulePicker && (
                <DateTimePicker
                  value={rescheduleDate ?? minDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={minDate}
                  onChange={(_, date) => {
                    onShowReschedulePicker(Platform.OS === "ios");
                    if (date) onRescheduleDateChange(date);
                  }}
                />
              )}
            </View>
          )}
          {rescheduleErrors.date && <ValidationMessage message={rescheduleErrors.date} />}

          {/* Time slots */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10, marginBottom: 4 }}>
            {TIME_SLOTS.map((slot) => {
              const sel = rescheduleSlot === slot;
              return (
                <Pressable
                  key={slot}
                  onPress={() => onRescheduleSlotChange(slot)}
                  style={({ pressed }) => ({
                    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1,
                    minWidth: "30%", alignItems: "center",
                    backgroundColor: sel ? (isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.1)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"),
                    borderColor: sel ? (isDark ? "rgba(56,189,248,0.5)" : "rgba(2,132,199,0.45)") : cardBorder,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ fontSize: 10, fontWeight: "700", color: sel ? accent : textSecondary, textAlign: "center" }}>
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {rescheduleErrors.timeSlot && <ValidationMessage message={rescheduleErrors.timeSlot} />}
          {rescheduleErrors.submit && <ValidationMessage message={rescheduleErrors.submit} />}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <Pressable
              onPress={onRescheduleClose}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                borderWidth: 1, borderColor: cardBorder,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: textSecondary, fontWeight: "700", fontSize: 13 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onRescheduleSubmit}
              disabled={rescheduling}
              style={({ pressed }) => ({
                flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: "center",
                flexDirection: "row", justifyContent: "center", gap: 6,
                backgroundColor: isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.12)",
                borderWidth: 1, borderColor: isDark ? "rgba(56,189,248,0.4)" : "rgba(2,132,199,0.35)",
                opacity: pressed || rescheduling ? 0.7 : 1,
              })}
            >
              {rescheduling && <ActivityIndicator size="small" color={accent} />}
              <Text style={{ color: accent, fontWeight: "800", fontSize: 13 }}>
                {rescheduling ? "Saving…" : "Confirm Reschedule"}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
