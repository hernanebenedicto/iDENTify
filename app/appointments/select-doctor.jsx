import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SelectService() {
  const { service } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
       <Text style={styles.title}>Service Selected</Text>
       <Text style={styles.subtitle}>{service}</Text>
       
       <TouchableOpacity 
         style={styles.button}
         onPress={() => router.push(`/appointments/select-doctor?service=${service}`)}
       >
         <Text style={styles.btnText}>Find a Doctor</Text>
         <Ionicons name="arrow-forward" size={20} color="white" />
       </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { fontSize: 20, color: '#1B93D5', marginVertical: 20 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1B93D5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center'
  },
  btnText: { color: 'white', fontSize: 18, fontWeight: '600', marginRight: 10 }
});