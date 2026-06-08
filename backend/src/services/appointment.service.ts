import { supabaseAdmin } from "../lib/supabase";
import type { AppointmentBody } from "../validation/appointment";

export interface AppointmentRow {
  id: string;
  user_id: string;
  vehicle_type: "2-wheeler" | "4-wheeler";
  date: string;
  time_slot: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export async function createAppointment(
  userId: string,
  data: AppointmentBody
): Promise<AppointmentRow> {
  const { data: row, error } = await supabaseAdmin
    .from("appointments")
    .insert({
      user_id: userId,
      vehicle_type: data.vehicleType,
      date: data.date,
      time_slot: data.timeSlot,
      status: "confirmed",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
  return row as AppointmentRow;
}

export async function getUserAppointments(userId: string): Promise<AppointmentRow[]> {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }
  return (data ?? []) as AppointmentRow[];
}

export async function getAppointmentByIdForUser(
  id: string,
  userId: string
): Promise<AppointmentRow | null> {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }
  return data as AppointmentRow | null;
}

export async function rescheduleAppointment(
  id: string,
  userId: string,
  newDate: string,
  newTimeSlot: string
): Promise<AppointmentRow> {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ date: newDate, time_slot: newTimeSlot, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reschedule appointment: ${error.message}`);
  }
  return data as AppointmentRow;
}

export async function cancelAppointment(
  id: string,
  userId: string
): Promise<AppointmentRow> {
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }
  return data as AppointmentRow;
}
