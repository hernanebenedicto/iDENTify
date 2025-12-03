import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BookAppointment() {
  const router = useRouter();

  const services = [
    { title: "Check-up", icon: "clipboard-pulse-outline", lib: "MaterialCommunityIcons" },
    { title: "Cleaning", icon: "water-outline", lib: "Ionicons" },
    { title: "Restoration", icon: "tooth-outline", lib: "MaterialCommunityIcons" }, // Filling
    { title: "Prophylaxis", icon: "sparkles-outline", lib: "Ionicons" },
    { title: "Extraction", icon: "content-cut", lib: "MaterialCommunityIcons" },
    { title: "Minor Surgery", icon: "medkit-outline", lib: "Ionicons" },
    { title: "Odontectomy", icon: "skull-outline", lib: "Ionicons" },
    { title: "Whitening", icon: "sunny-outline", lib: "Ionicons" },
  ];

  const renderIcon = (service) => {
    if (service.lib === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={service.icon} size={32} color="#1B93D5" />;
    }
    return <Ionicons name={service.icon} size={32} color="#1B93D5" />;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.subtitle}>Select a service to get started</Text>
      </View>

      <View style={styles.grid}>
        {services.map((service, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
              router.push("/appointments/select-service?service=" + service.title)
            }
          >
            <View style={styles.iconCircle}>
              {renderIcon(service)}
            </View>
            <Text style={styles.cardText}>{service.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  contentContainer: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 16, 
    color: "#64748B",
    fontWeight: "500", 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16, // Gap support depends on RN version, fallback margin used below if needed
  },
  card: {
    width: '47%', // 2 columns with spacing
    backgroundColor: "white",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9FF",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardText: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#334155",
    textAlign: 'center',
  },
});