// /app/(auth)/register.tsx
import { View, TextInput, Button } from "react-native";
import { useState } from "react";
import { register } from "../../src/api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: password,
      });

      alert("Registered!");
    } catch {
      alert("Error");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Name" onChangeText={setName} />
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}