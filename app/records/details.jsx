import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

export default function RecordDetails() {
  const { id } = useLocalSearchParams();

  // Mock record — replace with backend fetch
  const record = {
    id,
    diagnosis: "Tooth Extraction",
    doctor: "Dr. Ramos",
    date: "March 10, 2025",
    notes:
      "The patient underwent a standard tooth extraction. Procedure went smoothly with no complications.",
    prescription: "Ibuprofen 400mg, take every 6 hours as needed.",
    attachments: ["image1.png", "report.pdf"], // placeholders
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Record Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Diagnosis:</Text>
        <Text style={styles.value}>{record.diagnosis}</Text>

        <Text style={styles.label}>Doctor:</Text>
        <Text style={styles.value}>{record.doctor}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{record.date}</Text>

        <Text style={styles.label}>Doctor Notes:</Text>
        <Text style={styles.paragraph}>{record.notes}</Text>

        <Text style={styles.label}>Prescription:</Text>
        <Text style={styles.paragraph}>{record.prescription}</Text>

        <Text style={styles.label}>Attachments:</Text>

        {/* Placeholder attachments */}
        <View style={styles.attachments}>
          {record.attachments.map((file, index) => (
            <View key={index} style={styles.attachmentCard}>
              <Ionicons name="document-outline" size={28} color="#1B93D5" />
              <Text style={styles.attachmentLabel}>{file}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F8FF", flex: 1 },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    elevation: 3,
  },

  label: { color: "#555", marginTop: 14, fontSize: 14 },
  value: { fontSize: 18, fontWeight: "700", color: "#333" },

  paragraph: { fontSize: 15, color: "#333", marginTop: 6, lineHeight: 22 },

  attachments: {
    marginTop: 12,
  },

  attachmentCard: {
    backgroundColor: "#eef8ff",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },

  attachmentLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: "#1B93D5",
    fontWeight: "600",
  },
});
