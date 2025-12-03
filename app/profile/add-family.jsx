import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API, fetchPatientByEmail } from "../../constants/Api";

export default function AddFamilyMember() {
  const router = useRouter();
  const { user } = useUser();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  
  const [parentPatient, setParentPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the parent's patient record to get their ID
    const loadParent = async () => {
      if (!user) return;
      const patient = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);
      setParentPatient(patient);
    };
    loadParent();
  }, [user]);

  const saveMember = async () => {
    if (!name || !age) {
      Alert.alert("Missing Info", "Please enter a name and age.");
      return;
    }
    if (!parentPatient) {
      Alert.alert("Error", "Could not identify the primary account holder.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API.patients, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          parent_id: parentPatient.id, // Link to the logged-in user
          vitals: { age: age },
          // email can be null for dependents
        }),
      });

      if (res.ok) {
        Alert.alert("Success", "Family member added.");
        router.back();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add family member.");
      }
    } catch (error) {
      console.error("Error adding family member:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Family Member</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Jane Doe"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 12"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TouchableOpacity 
        style={[styles.saveBtn, loading && {backgroundColor: '#ccc'}]} 
        onPress={saveMember}
        disabled={loading}
       >
       {loading ? (
           <ActivityIndicator color="#fff" />
       ) : (
           <Text style={styles.saveText}>Save Member</Text>
       )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F8FF", flex: 1 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6, marginLeft: 4},
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    borderColor: "#ddd",
    borderWidth: 1,
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center'
  },
  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});