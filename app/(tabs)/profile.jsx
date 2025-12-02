import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <View style={styles.card}>
        <Ionicons name="person-circle-outline" size={70} color="#1B93D5" />
        <Text style={styles.name}>{user?.fullName || "Unnamed User"}</Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push("/profile/edit")}
      >
        <Ionicons name="create-outline" size={22} color="#1B93D5" />
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => router.push("/profile/family")}
      >
        <Ionicons name="people-outline" size={22} color="#1B93D5" />
        <Text style={styles.optionText}>Family Members</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },

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
    alignItems: "center",
    elevation: 2,
    marginBottom: 30,
  },

  name: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  email: { color: "#555", marginTop: 4 },

  option: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: "center",
    marginBottom: 12,
  },

  optionText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
});
