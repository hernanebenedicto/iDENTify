import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function EditProfile() {
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.unsafeMetadata?.phone || "");
  const [address, setAddress] = useState(user?.unsafeMetadata?.address || "");

  const saveChanges = async () => {
    await user.update({
      fullName: name,
      unsafeMetadata: { phone, address },
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F8FF" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  saveButton: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  saveText: { textAlign: "center", color: "white", fontWeight: "700" },
});
