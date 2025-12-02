import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function RecordsScreen() {
  const router = useRouter();

  const records = [
    {
      id: 1,
      date: "March 10, 2025",
      doctor: "Dr. Riz",
      diagnosis: "Tooth Extraction",
      status: "Completed",
    },
    {
      id: 2,
      date: "January 22, 2025",
      doctor: "Dr. John",
      diagnosis: "Routine Check-up",
      status: "Completed",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Medical Records</Text>

      {records.map((rec) => (
        <TouchableOpacity
          key={rec.id}
          style={styles.card}
          onPress={() => router.push(`/records/details?id=${rec.id}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{rec.diagnosis}</Text>
            <Text style={styles.cardInfo}>Doctor: {rec.doctor}</Text>
            <Text style={styles.cardInfo}>Date: {rec.date}</Text>
            <Text style={styles.statusDone}>Status: {rec.status}</Text>
          </View>
          <Ionicons name="chevron-forward" size={26} color="#1B93D5" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 20, color: "#333" },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  cardTitle: { fontSize: 18, fontWeight: "700", color: "#1B93D5" },
  cardInfo: { color: "#555", marginTop: 4 },

  statusDone: {
    marginTop: 8,
    color: "#2ecc71",
    fontWeight: "700",
  },
});
