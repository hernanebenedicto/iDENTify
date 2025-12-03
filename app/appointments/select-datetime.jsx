import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { API, fetchPatientByEmail } from "../../constants/Api";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function ConfirmAppointment() {
  const router = useRouter();
  const { user } = useUser();
  const { doctor, docId, service } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);

  // Generate next 3 days
  const today = new Date();
  const dates = [0, 1, 2].map(days => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return {
      iso: d.toISOString().split('T')[0], // YYYY-MM-DD
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate()
    };
  });
  
  const [selectedDate, setSelectedDate] = useState(dates[0].iso);
  const times = ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM"];

  const bookAppointment = async (time) => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setLoading(true);
    try {
      // 1. Get Patient ID
      let patient = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);
      
      // Auto-create patient if missing (Just-in-time creation)
      if (!patient) {
        const createPatientRes = await fetch(API.patients, {
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

        if (!createPatientRes.ok) {
          Alert.alert("Error", "Could not create patient profile.");
          return;
        }
        patient = await createPatientRes.json();
      }

      // 2. Prepare Payload
      const payload = {
        patient_id: patient.id,
        dentist_id: docId,
        timeStart: `${selectedDate} ${time}`,
        timeEnd: `${selectedDate} ${time}`, // Basic logic
        procedure: service,
        status: "Scheduled",
        notes: "Booked via App"
      };

      // 3. Post to API
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
      Alert.alert("Error", "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Confirm Booking</Text>
        <Text style={styles.subtitle}>Finalize your appointment details</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={styles.iconBox}>
            <Ionicons name="medkit" size={20} color="#1B93D5" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>{doctor || "Any Specialist"}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.summaryItem}>
          <View style={styles.iconBox}>
            <Ionicons name="clipboard" size={20} color="#1B93D5" />
          </View>
          <View>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>{service || "General Checkup"}</Text>
          </View>
        </View>
      </View>

      {/* Date Selector */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <View style={styles.datesRow}>
        {dates.map((d) => {
          const isSelected = selectedDate === d.iso;
          return (
            <TouchableOpacity 
                key={d.iso}
                style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                onPress={() => setSelectedDate(d.iso)}
                activeOpacity={0.7}
            >
                <Text style={[styles.dayNum, isSelected && styles.selectedText]}>
                    {d.iso}
                </Text>
            </TouchableOpacity>

          );
        })}
      </View>

      {/* Time Selector */}
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeGrid}>
        {loading ? (
          <ActivityIndicator size="large" color="#1B93D5" style={{ marginVertical: 20 }} />
        ) : (
          times.map((time, i) => (
            <TouchableOpacity
              key={i}
              style={styles.timeButton}
              onPress={() => bookAppointment(time)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={18} color="#1B93D5" style={{ marginRight: 8 }} />
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#64748B", 
    fontWeight: "500" 
  },

  /* Summary Card */
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 32,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
    marginLeft: 56, // Align with text
  },

  /* Sections */
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Date Selector */
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  dateCard: {
    width: '30%',
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDateCard: {
    backgroundColor: "#1B93D5",
    borderColor: "#1B93D5",
    shadowColor: "#1B93D5",
    shadowOpacity: 0.3,
    elevation: 4,
  },
  dayName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
  },
  selectedText: {
    color: "white",
  },

  /* Time Grid */
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeButton: {
    width: '48%', // 2 columns
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
});