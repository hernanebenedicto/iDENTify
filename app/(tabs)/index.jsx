import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.logo}>iDENTify</Text>
        </Text>
        <Text style={styles.subtitle}>Your trusted dental care assistant.</Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <QuickAction
          icon="calendar-outline"
          label="Appointment"
          onPress={() => router.push("/appointments")}
        />
        <QuickAction
          icon="list-outline"
          label="Queue"
          onPress={() => router.push("/queue")}
        />
        <QuickAction
          icon="folder-outline"
          label="Records"
          onPress={() => router.push("/records")}
        />
        <QuickAction
          icon="people-outline"
          label="Family"
          onPress={() => router.push("/profile/family")}
        />
      </View>

      <Text style={styles.sectionTitle}>Services</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesSlider}
      >
        <ServiceCard
          title="Check-up"
          description="General oral health examination."
          icon="clipboard-outline"
        />
        <ServiceCard
          title="Restoration"
          description="Repair of damaged teeth using fillings."
          icon="construct-outline"
        />
        <ServiceCard
          title="Prophylaxis"
          description="Professional teeth cleaning."
          icon="sparkles-outline"
        />
        <ServiceCard
          title="Extraction"
          description="Removal of decayed or problematic teeth."
          icon="remove-circle-outline"
        />
        <ServiceCard
          title="Minor Surgery"
          description="Small oral surgical treatments."
          icon="medkit-outline"
        />
        <ServiceCard
          title="Odontectomy"
          description="Removal of impacted teeth."
          icon="skull-outline"
        />
      </ScrollView>

      <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
      <View style={styles.appointmentCard}>
        <View>
          <Text style={styles.appointmentTitle}>Dental Check-up</Text>
          <Text style={styles.appointmentInfo}>Date: March 15, 2025</Text>
          <Text style={styles.appointmentInfo}>Status: Pending</Text>
        </View>
        <Ionicons name="chevron-forward" size={28} color="#1B93D5" />
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.actionBox} onPress={onPress}>
      <View style={styles.actionIconContainer}>
        <Ionicons name={icon} size={30} color="#1B93D5" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ServiceCard({ title, description, icon }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIconContainer}>
        <Ionicons name={icon} size={26} color="#1B93D5" />
      </View>
      <Text style={styles.serviceText}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8FF",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 10,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1B1D29",
  },

  subtitle: {
    color: "#6A6A6A",
    fontSize: 15,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 10,
    color: "#1B1D29",
  },

  quickActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  actionBox: {
    width: "47%",
    backgroundColor: "white",
    paddingVertical: 25,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#A0AEC0",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
  },

  actionIconContainer: {
    backgroundColor: "#EAF6FF",
    padding: 14,
    borderRadius: 50,
  },

  actionLabel: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#1B1D29",
  },

  servicesSlider: {
    paddingVertical: 10,
    paddingRight: 10,
  },

  serviceCard: {
    width: 180,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginRight: 15,
    elevation: 4,
    shadowColor: "#A0AEC0",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
  },

  serviceIconContainer: {
    backgroundColor: "#EAF6FF",
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },

  serviceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1D29",
    marginBottom: 4,
  },

  serviceDescription: {
    fontSize: 12,
    color: "#6A6A6A",
    textAlign: "center",
    lineHeight: 16,
  },

  appointmentCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#A0AEC0",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 30,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  appointmentTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 5,
  },

  appointmentInfo: {
    color: "#666",
    fontSize: 13,
  },
  logo: {
    color: "#1B93D5",
  },
});
