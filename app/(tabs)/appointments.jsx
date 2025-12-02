import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AppointmentsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => router.push("/appointments/book")}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={styles.bookText}>Book Appointment</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Upcoming</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/appointments/details")}
      >
        <View>
          <Text style={styles.cardTitle}>Dental Check-Up</Text>
          <Text style={styles.cardInfo}>Doctor: Dr. Santos</Text>
          <Text style={styles.cardInfo}>March 15, 2025 - 10:00 AM</Text>
          <Text style={styles.statusPending}>Status: Pending</Text>
        </View>
        <Ionicons name="chevron-forward" size={26} color="#1B93D5" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },

  bookButton: {
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#1B93D5",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bookText: { color: "#fff", marginLeft: 8, fontSize: 16, fontWeight: "600" },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardInfo: { color: "#555" },
  statusPending: { marginTop: 4, color: "#f39c12", fontWeight: "700" },
});
