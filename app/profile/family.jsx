import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API, fetchPatientByEmail } from "../../constants/Api";

export default function FamilyMembers() {
  const router = useRouter();
  const { user } = useUser();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFamilyMembers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Find the current user's patient ID
      const parent = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);
      if (!parent) {
        setMembers([]);
        return;
      }

      // 2. Fetch family members linked to that ID
      const res = await fetch(`${API.patients}/${parent.id}/family`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        console.error("Failed to fetch family members");
      }
    } catch (error) {
      console.error("Error loading family members", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFamilyMembers();
    }, [loadFamilyMembers])
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFamilyMembers} />}
    >
      <Text style={styles.title}>Family Members</Text>

      {loading && members.length === 0 ? (
        <ActivityIndicator size="large" color="#1B93D5" />
      ) : members.length === 0 ? (
        <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No family members added yet.</Text>
            <Text style={styles.emptySubtext}>Tap the button below to add one.</Text>
        </View>
      ) : (
        members.map((m) => (
          <View key={m.id} style={styles.card}>
            <Ionicons name="person-outline" size={32} color="#1B93D5" />
            <View style={styles.memberInfo}>
                <Text style={styles.name}>{m.full_name}</Text>
                <Text style={styles.info}>
                    {m.vitals?.age ? `${m.vitals.age} years old` : "Age not set"}
                </Text>
            </View>
          </View>
        ))
      )}

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
  container: { 
      flex: 1,
      padding: 20, 
      backgroundColor: "#F4F8FF" 
  },
  title: { 
      fontSize: 26, 
      fontWeight: "700", 
      marginBottom: 20 
  },
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberInfo: {
    marginLeft: 15,
  },
  name: { 
      fontSize: 18, 
      fontWeight: "700" 
  },
  info: { 
      color: "#555", 
      marginTop: 4 
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555'
  },
  emptySubtext: {
      fontSize: 14,
      color: '#888',
      marginTop: 5
  },
  addButton: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  addText: { 
      color: "white", 
      fontSize: 16, 
      fontWeight: "700", 
      marginLeft: 8 
  },
});