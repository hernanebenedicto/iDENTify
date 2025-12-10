import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { API, fetchPatientByEmail } from "../../constants/Api";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmAppointment() {
  const router = useRouter();
  const { user } = useUser();
  const { doctor, docId, service } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [dentist, setDentist] = useState(null);
  const [fetchingDentist, setFetchingDentist] = useState(true);

  // 1. Fetch Dentist Details
  useEffect(() => {
    const fetchDentist = async () => {
      try {
        const res = await fetch(`${API.dentists}`);
        const allDentists = await res.json();
        const selected = allDentists.find(d => String(d.id) === String(docId));
        setDentist(selected);
      } catch (err) {
        console.error("Error fetching dentist schedule", err);
      } finally {
        setFetchingDentist(false);
      }
    };
    fetchDentist();
  }, [docId]);

  // 2. Generate Next 5 Days
  const today = new Date();
  const dates = [0, 1, 2, 3, 4].map(days => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);

    // Force Local YYYY-MM-DD to avoid UTC shifts
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return {
      iso: `${year}-${month}-${day}`,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      dayIndex: d.getDay() // 0=Sun, 1=Mon, etc.
    };
  });

  const [selectedDate, setSelectedDate] = useState(dates[0].iso);

  // 3. Generate Time Slots
  const availableSlots = useMemo(() => {
    if (!dentist) return [];

    // Safety check: If dentist is somehow "Off", return empty immediately
    if (dentist.status === 'Off') return [];

    const toMin = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const slots = [];
    const operatingStart = dentist.operatingHours?.start || "09:00";
    const operatingEnd = dentist.operatingHours?.end || "17:00";

    const startMin = toMin(operatingStart);
    const endMin = toMin(operatingEnd);

    // Selected Date Info
    const selectedDateObj = dates.find(d => d.iso === selectedDate);
    const dayIdx = selectedDateObj ? selectedDateObj.dayIndex : -1;

    // A. Check Working Days (Array of numbers [1, 3, 5])
    // Make sure we compare numbers to numbers
    const isWorkingDay = dentist.days && dentist.days.some(d => Number(d) === dayIdx);

    if (!isWorkingDay) {
      return []; // Not a working day
    }

    // B. Check Leave Days
    if (dentist.leaveDays && dentist.leaveDays.includes(selectedDate)) {
      return []; // On Leave
    }

    // C. Generate Slots
    for (let time = startMin; time < endMin; time += 30) {
      const h = Math.floor(time / 60);
      const m = time % 60;

      // D. Check Lunch
      if (dentist.lunch) {
        const lStart = toMin(dentist.lunch.start);
        const lEnd = toMin(dentist.lunch.end);
        if (time >= lStart && time < lEnd) continue; // Skip lunch slots
      }

      // E. Check Breaks
      let isBreak = false;
      if (dentist.breaks && Array.isArray(dentist.breaks)) {
        for (let b of dentist.breaks) {
          const bStart = toMin(b.start);
          const bEnd = toMin(b.end);
          // Overlap check: slot start is inside break?
          if (time >= bStart && time < bEnd) {
            isBreak = true;
            break;
          }
        }
      }
      if (isBreak) continue;

      // F. Format Time
      const timeStr24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayTime = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;

      slots.push({ value: timeStr24, label: displayTime });
    }

    return slots;
  }, [dentist, selectedDate]);

  const bookAppointment = async (timeSlot) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setLoading(true);
    try {
      let patient = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);

      if (!patient) {
        const createRes = await fetch(API.patients, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: user.fullName,
            email: user.primaryEmailAddress.emailAddress,
            address: "N/A",
            contact_number: "",
            gender: "Unspecified"
          })
        });

        if (!createRes.ok) {
          Alert.alert("Error", "Could not create patient profile.");
          setLoading(false);
          return;
        }
        patient = await createRes.json();
      }

      const fullDateTime = `${selectedDate} ${timeSlot.value}:00`;

      const payload = {
        patient_id: patient.id,
        dentist_id: docId,
        timeStart: fullDateTime,
        timeEnd: fullDateTime,
        procedure: service,
        status: "Scheduled",
        notes: "Booked via App"
      };

      const res = await fetch(API.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", "Appointment Booked!", [
          { text: "OK", onPress: () => router.replace("/(tabs)/appointments") }
        ]);
      } else {
        Alert.alert("Failed", "Could not book appointment.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDentist) {
    return <View style={styles.loadingCenter}><ActivityIndicator size="large" color="#1B93D5" /></View>;
  }

  // Helper to show why a day is disabled
  const getDayStatus = (d) => {
    if (dentist?.status === 'Off') return "Off";
    if (dentist?.leaveDays?.includes(d.iso)) return "Leave";
    // Ensure numeric comparison
    const works = dentist?.days?.some(day => Number(day) === d.dayIndex);
    return works ? "Open" : "Off";
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
        <Text style={styles.subtitle}>with {doctor}</Text>
        {dentist?.status === 'Off' && (
          <Text style={{ color: '#EF4444', fontWeight: 'bold', marginTop: 8 }}>
            Note: This dentist is currently marked as Off.
          </Text>
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.iconBox}>
            <Ionicons name="clipboard" size={20} color="#1B93D5" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service || "Checkup"}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
        {dates.map((d) => {
          const isSelected = selectedDate === d.iso;
          const status = getDayStatus(d);
          const isDisabled = status !== "Open";

          return (
            <TouchableOpacity
              key={d.iso}
              style={[
                styles.dateCard,
                isSelected && styles.selectedDateCard,
                isDisabled && styles.disabledDateCard
              ]}
              onPress={() => !isDisabled && setSelectedDate(d.iso)}
              activeOpacity={0.7}
              disabled={isDisabled}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedText]}>{d.dayName}</Text>
              <Text style={[styles.dayNum, isSelected && styles.selectedText]}>
                {d.dayNum}
              </Text>
              {isDisabled && (
                <Text style={{ fontSize: 10, color: '#EF4444', marginTop: 2, fontWeight: '600' }}>
                  {status}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available Times</Text>

      {availableSlots.length === 0 ? (
        <View style={styles.noSlotsBox}>
          <Text style={styles.noSlotsText}>
            {dentist?.status === 'Off'
              ? "Dentist is currently unavailable."
              : "No available slots for this date."}
          </Text>
        </View>
      ) : (
        <View style={styles.timeGrid}>
          {loading ? (
            <ActivityIndicator size="large" color="#1B93D5" style={{ marginVertical: 20 }} />
          ) : (
            availableSlots.map((slot, i) => (
              <TouchableOpacity
                key={i}
                style={styles.timeButton}
                onPress={() => bookAppointment(slot)}
                activeOpacity={0.7}
              >
                <Text style={styles.timeText}>{slot.label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  contentContainer: { padding: 24, paddingTop: 40 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#1E293B", marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: "#64748B", fontWeight: "500" },
  summaryCard: { backgroundColor: "white", borderRadius: 20, padding: 20, shadowColor: "#64748B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: "#F1F5F9", marginBottom: 32 },
  summaryItem: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  summaryLabel: { fontSize: 12, color: "#94A3B8", fontWeight: "600", textTransform: "uppercase", marginBottom: 2 },
  summaryValue: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#94A3B8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  datesScroll: { marginBottom: 32, flexDirection: 'row' },
  dateCard: { width: 70, height: 90, backgroundColor: "white", borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "#E2E8F0", marginRight: 12 },
  selectedDateCard: { backgroundColor: "#1B93D5", borderColor: "#1B93D5" },
  disabledDateCard: { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", opacity: 0.8 },
  dayName: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 4 },
  dayNum: { fontSize: 22, fontWeight: "800", color: "#1E293B" },
  selectedText: { color: "white" },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  timeButton: { width: '30%', backgroundColor: "white", borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 8 },
  timeText: { fontSize: 14, fontWeight: "600", color: "#334155" },
  noSlotsBox: { padding: 20, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12 },
  noSlotsText: { color: '#64748B', fontStyle: 'italic', textAlign: 'center' }
});