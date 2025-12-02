import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SelectDateTime() {
  const { doctor, service } = useLocalSearchParams();
  const router = useRouter();

  const dates = ["March 14", "March 15", "March 16"];
  const times = ["9:00 AM", "10:00 AM", "2:00 PM"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Date & Time</Text>

      <Text style={styles.subheading}>Doctor: {doctor}</Text>
      <Text style={styles.subheading}>Service: {service}</Text>

      <Text style={styles.label}>Choose a date:</Text>
      {dates.map((d, i) => (
        <TouchableOpacity
          key={i}
          style={styles.option}
          onPress={() =>
            router.push(
              `/appointments/select-datetime?doctor=${doctor}&service=${service}&date=${d}`
            )
          }
        >
          <Text>{d}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 10 },
  subheading: { fontSize: 16, color: "#666", marginBottom: 5 },
  label: { marginTop: 20, marginBottom: 10, fontSize: 16, fontWeight: "600" },
  option: {
    padding: 14,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
});
