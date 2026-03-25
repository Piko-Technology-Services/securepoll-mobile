// /app/(auth)/register.tsx
import {
  KeyboardAvoidingView, ScrollView,
  TouchableWithoutFeedback, TextInput, Text, TouchableOpacity, Image, StyleSheet, Keyboard, Platform,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { register } from "../../src/api/auth";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Register() {

  // alert(process.env.EXPO_PUBLIC_API_URL);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // console.log({ name, email, password });
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: password,
      });

      alert("Registered!");
      router.replace("/login");
    } catch {
      alert("Register Failed, Something Went Wrong, Try Again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}}  behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
        <KeyboardAwareScrollView
                  contentContainerStyle={styles.container}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  enableOnAndroid={true}
                >
          <Image
            source={require("../../assets/images/react-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Create Account</Text>

          <TextInput placeholder="Name" placeholderTextColor="#999" style={styles.input} onChangeText={setName} />
          <TextInput placeholder="Email" placeholderTextColor="#999" style={styles.input} onChangeText={setEmail} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            
             {!loading ? (
                <Text style={styles.buttonText}>Register</Text>
              ) : (
                <ActivityIndicator color="#fff" />
              )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Already have an account?</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
    color: "#111",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#4281A6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
});