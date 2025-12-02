import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function QueueScreen() {
  const [queue] = useState({
    currentNumber: 21,
    yourNumber: 35,
    status: "Waiting",
    estimate: "25 minutes",
  });

  const getStatusColor = () => {
    switch (queue.status) {
      case "Now Serving":
        return "#27ae60";
      case "Near":
        return "#f39c12";
      case "Waiting":
        return "#3498db";
      case "Done":
        return "#2ecc71";
      default:
        return "#555";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Queue Status</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Now Serving</Text>
        <Text style={styles.nowServing}>{queue.currentNumber}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Your Number</Text>
        <Text style={styles.yourNumber}>{queue.yourNumber}</Text>

        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{queue.status}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Estimated Time</Text>
        <Text style={styles.estimate}>{queue.estimate}</Text>
      </View>

      <TouchableOpacity style={styles.refreshBtn}>
        <Ionicons name="refresh-outline" size={22} color="#fff" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    elevation: 2,
    marginBottom: 16,
  },

  cardLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },

  nowServing: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1B93D5",
  },

  yourNumber: {
    fontSize: 40,
    fontWeight: "800",
    color: "#34495e",
  },

  estimate: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B93D5",
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "white",
    fontWeight: "700",
  },

  refreshBtn: {
    backgroundColor: "#1B93D5",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  refreshText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
