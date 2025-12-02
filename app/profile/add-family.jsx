import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function AddFamilyMember() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [age, setAge] = useState("");

  const saveMember = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Family Member</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      {/* <TextInput
        style={styles.input}
        placeholder="Relationship (e.g., Mother)"
        value={relationship}
        onChangeText={setRelationship}
      /> */}

      <TextInput
        style={styles.input}
        placeholder="Age"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveMember}>
        <Text style={styles.saveText}>Save Member</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F4F8FF", flex: 1 },

  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },

  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    borderColor: "#ddd",
    borderWidth: 1,
  },

  saveBtn: {
    backgroundColor: "#1B93D5",
    padding: 14,
    borderRadius: 12,
  },

  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
