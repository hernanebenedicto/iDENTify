import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { API, fetchPatientByEmail } from "../../constants/Api";

export default function EditProfile() {
  const { user } = useUser();
  const router = useRouter();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Data state
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile data from our database when the component mounts
  useEffect(() => {
    const loadPatientData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const patientData = await fetchPatientByEmail(
          user.primaryEmailAddress.emailAddress
        );
        if (patientData) {
          setPatient(patientData);
          setName(patientData.full_name || "");
          setPhone(patientData.contact_number || "");
          setAddress(patientData.address || "");
        }
      } catch (error) {
        console.error("Failed to load patient data", error);
        Alert.alert("Error", "Could not load your profile data.");
      } finally {
        setLoading(false);
      }
    };
    loadPatientData();
  }, [user]);

  const saveChanges = async () => {
    if (!patient) {
      Alert.alert("Error", "Could not find patient profile to update.");
      return;
    }
    setLoading(true);
    try {
      // 1. Update our local database
      const res = await fetch(`${API.patients}/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          contact_number: phone,
          address: address,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile in local database.");
      }

      // 2. Also update Clerk's user record to keep it in sync
      await user.update({
        fullName: name,
      });

      Alert.alert("Success", "Your profile has been updated.");
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !patient) {
      return (
          <View style={[styles.container, {justifyContent: 'center'}]}>
              <ActivityIndicator size="large" color="#1B93D5" />
          </View>
      )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your full name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Your address"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabledButton]} 
        onPress={saveChanges}
        disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color="#fff" />
        ) : (
            <Text style={styles.saveText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#444',
      marginBottom: 6,
      marginLeft: 4
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 15
  },
  saveButton: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  disabledButton: {
      backgroundColor: '#a0a0a0'
  },
  saveText: { textAlign: "center", color: "white", fontWeight: "700", fontSize: 16 },
});