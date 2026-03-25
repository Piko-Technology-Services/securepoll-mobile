// /app/(auth)/login.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,  Keyboard,
  ActivityIndicator
} from "react-native";
import { login } from "../../src/api/auth";
import { setToken } from "../../src/lib/storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login({ email, password });
      await setToken(res.data.token);
      router.replace("/");
    } catch {
      alert("Login failed, Something Went Wrong, Try Again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>

      {/* Inputs */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles.input}
        onChangeText={setEmail}
        cursorColor="#111"     
        selectionColor="#111"    
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        cursorColor="#111"     
        selectionColor="#111" 
      />

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {!loading ? (
          <Text style={styles.buttonText}>Login</Text>
        ) : (
          <ActivityIndicator color="#fff" />
        )}
      </TouchableOpacity>

      {/* Link */}
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
        </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
      {/* Logo */}
      
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
    color: "#111",
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