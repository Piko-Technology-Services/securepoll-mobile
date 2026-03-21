// /app/(auth)/login.tsx
import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import { login } from "../../src/api/auth";
import { setToken } from "../../src/lib/storage";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password });

      await setToken(res.data.token);

      router.replace("/");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}