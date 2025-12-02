import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BookAppointment() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      <Text style={styles.subtitle}>Step 1: Choose a Service</Text>

      {[
        { title: "Check-up" },
        { title: "Dental" },
        { title: "Restoration" },
        { title: "Prophylaxis" },
        { title: "Extraction" },
        { title: "Minor Surgery" },
        { title: "Odontectomy" },
      ].map((service, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() =>
            router.push("/appointments/select-service?service=" + service.title)
          }
        >
          <Ionicons name={service.icon} size={32} color="#1B93D5" />
          <Text style={styles.cardText}>{service.title}</Text>
          <Ionicons name="chevron-forward" size={22} color="#aaa" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#555", marginBottom: 20 },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardText: { flex: 1, fontSize: 16, fontWeight: "600", marginLeft: 10 },
});
