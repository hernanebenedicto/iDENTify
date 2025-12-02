import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppointmentDetails() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Details</Text>

      <View style={styles.detailCard}>
        <Text style={styles.label}>Service:</Text>
        <Text style={styles.value}>Dental Check-up</Text>

        <Text style={styles.label}>Doctor:</Text>
        <Text style={styles.value}>Dr. Santos</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>March 15, 2025</Text>

        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>10:00 AM</Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.pending}>Pending</Text>
      </View>

      <Ionicons name="information-circle-outline" size={32} color="#1B93D5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F8FF", flex: 1 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  detailCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },

  label: { fontSize: 14, color: "#777", marginTop: 10 },
  value: { fontSize: 18, fontWeight: "600", color: "#333" },
  pending: { color: "#f39c12", fontSize: 18, fontWeight: "700" },
});
