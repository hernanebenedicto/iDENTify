import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ConfirmAppointment() {
  const router = useRouter();
  const { doctor, service, date } = useLocalSearchParams();

  const times = ["9:00 AM", "10:00 AM", "2:00 PM"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick a Time</Text>

      {times.map((time, i) => (
        <TouchableOpacity
          key={i}
          style={styles.option}
          onPress={() => router.replace("/(tabs)/appointments")}
        >
          <Text>
            {date} — {time}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  option: {
    padding: 14,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
});
