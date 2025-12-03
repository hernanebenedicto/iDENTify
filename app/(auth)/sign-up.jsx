import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
// Ensure relative path is correct: ../../ points to root from app/(auth)/
import { API } from "../../constants/Api"; 

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Step 1: Create Account in Clerk & Send Email
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name.");
      return;
    }

    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Sign Up Error", err.errors ? err.errors[0].message : "Something went wrong");
    }
  };

  // Step 2: Verify Email & Create Patient in MySQL Database
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        
        // --- BACKEND CONNECTION START ---
        // Create the patient in your MySQL database now that they are verified
        try {
          const res = await fetch(API.patients, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: fullName,
              email: emailAddress.trim(),
              address: "Update your profile", // Default values
              contact_number: "",
              gender: "Unspecified"
            })
          });
          
          if (!res.ok) {
            console.error("Failed to create patient in DB");
          }
        } catch (dbError) {
          console.error("Database Error:", dbError);
          // We don't block login if DB fails, but we log it
        }
        // --- BACKEND CONNECTION END ---

        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        Alert.alert("Verification Failed", "Please check your code and try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", "Verification failed.");
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <Text style={styles.verifyTitle}>Verify your email</Text>
          <Text style={styles.subtitle}>Enter the code sent to {emailAddress}</Text>

          <TextInput
            value={code}
            placeholder="Enter verification code"
            onChangeText={setCode}
            style={styles.input}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.appName}>iDENTify</Text>
          <Text style={styles.title}>Create Account</Text>

          {/* Added Full Name Field */}
          <TextInput
            value={fullName}
            placeholder="Full Name"
            onChangeText={setFullName}
            style={styles.input}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={emailAddress}
            placeholder="Enter email"
            onChangeText={setEmailAddress}
            style={styles.input}
          />

          <TextInput
            value={password}
            placeholder="Enter password"
            secureTextEntry={true}
            onChangeText={setPassword}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in">
              <Text style={styles.link}>Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    paddingTop: 40,
    paddingBottom: 40,
  },

  appName: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    color: "#1A7FCC",
    marginBottom: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#2A2A2A",
    marginBottom: 35,
  },

  verifyTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A7FCC",
    marginBottom: 10,
  },
  
  subtitle: {
    textAlign: "center", 
    color: "#666", 
    marginBottom: 20
  },

  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    fontSize: 16,
    borderColor: "#D3DDEE",
    borderWidth: 1.3,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },

  button: {
    backgroundColor: "#1A7FCC",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  footerText: {
    color: "#555",
  },

  link: {
    marginLeft: 5,
    color: "#1A7FCC",
    fontWeight: "700",
  },
});