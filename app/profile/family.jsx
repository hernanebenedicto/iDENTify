import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function FamilyMembers() {
  const router = useRouter();

  // Replace with backend later
  const [members, setMembers] = useState([
    { id: 1, name: "Maria Santos", relationship: "Mother", age: 52 },
    { id: 2, name: "Mark Santos", relationship: "Brother", age: 18 },
  ]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Family Members</Text>

      {members.map((m) => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.info}>
            {m.relationship} — {m.age} yrs
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/profile/add-family")}
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addText}>Add Family Member</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F8FF" },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },

  name: { fontSize: 18, fontWeight: "700" },
  info: { color: "#555", marginTop: 4 },

  addButton: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },

  addText: { color: "white", fontSize: 16, fontWeight: "700", marginLeft: 8 },
});
