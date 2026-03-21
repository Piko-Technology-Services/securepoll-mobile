import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import axios from "axios";
import { getToken } from "../../../src/lib/storage";

export default function VoteVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pollId = params.pollId as string;
  const selections = JSON.parse((params.selections as string) || "{}");

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [bioVerified, setBioVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = otpVerified && bioVerified && passwordVerified;

  const handleOtpVerify = () => {
    // Here you should call your API to verify OTP
    if (otp.length === 6) {
      setOtpVerified(true);
      Alert.alert("OTP verified!");
    } else {
      Alert.alert("Invalid OTP");
    }
  };

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Verify your identity",
    });
    if (result.success) {
      setBioVerified(true);
      Alert.alert("Biometric verified!");
    }
  };

  const handlePasswordVerify = () => {
    // Here you should call your API to verify password
    if (password.length > 0) {
      setPasswordVerified(true);
      Alert.alert("Password verified!");
    } else {
      Alert.alert("Invalid password");
    }
  };

  const submitVote = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/${pollId}/vote`,
        {
          selections,
          verification: {
            otp: true,
            biometric: true,
            password: true,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Vote cast successfully!");
      router.replace("/"); // Navigate back to dashboard
    } catch (err) {
      console.log(err);
      Alert.alert("Error submitting vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Complete Vote Verification</Text>

      {/* OTP Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>OTP (Email)</Text>
        <TextInput
          placeholder="Enter OTP"
          style={styles.input}
          value={otp}
          onChangeText={setOtp}
        />
        <TouchableOpacity style={styles.verifyBtn} onPress={handleOtpVerify}>
          <Text style={styles.verifyText}>{otpVerified ? "Verified" : "Verify OTP"}</Text>
        </TouchableOpacity>
      </View>

      {/* Biometric Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Biometric</Text>
        <TouchableOpacity style={styles.verifyBtn} onPress={handleBiometric}>
          <Text style={styles.verifyText}>{bioVerified ? "Verified" : "Verify Biometric"}</Text>
        </TouchableOpacity>
      </View>

      {/* Password Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This App Account Password</Text>
        <TextInput
          placeholder="Enter Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.verifyBtn} onPress={handlePasswordVerify}>
          <Text style={styles.verifyText}>
            {passwordVerified ? "Verified" : "Verify Password"}
          </Text>
        </TouchableOpacity>
      </View>

      {canSubmit && (
        <TouchableOpacity style={styles.submitBtn} onPress={submitVote}>
          <Text style={styles.submitText}>{loading ? "Submitting..." : "Complete Vote"}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  verifyBtn: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  verifyText: { color: "#fff", fontWeight: "600" },
  submitBtn: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { color: "#fff", fontWeight: "700" },
});