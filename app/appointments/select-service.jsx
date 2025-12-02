import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SelectDoctor() {
  const { service } = useLocalSearchParams();
  const router = useRouter();

  const doctors = [
    { name: "Dr. Santos", specialty: service },
    { name: "Dr. Cruz", specialty: service },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Doctor</Text>
      <Text style={styles.subtitle}>{service}</Text>

      {doctors.map((doc, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() =>
            router.push(
              `/appointments/select-doctor?doctor=${doc.name}&service=${service}`
            )
          }
        >
          <Ionicons name="person-circle-outline" size={40} color="#1B93D5" />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{doc.name}</Text>
            <Text style={styles.cardSubtitle}>{service}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { color: "#777", marginBottom: 20 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },

  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardSubtitle: { fontSize: 14, color: "#555" },
});
