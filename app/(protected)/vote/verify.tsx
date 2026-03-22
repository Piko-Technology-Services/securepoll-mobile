import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import axios from "axios";
import { getToken } from "../../../src/lib/storage";


export default function VoteVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pollId = params.pollId as string;
  const selections = JSON.parse((params.selections as string) || "{}");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const [bioVerified, setBioVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = otpVerified && bioVerified && passwordVerified;


  const sendOtp = async () => {
      setLoadingOtp(true);
    try {
      const token = await getToken();

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/send-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOtpSent(true);
      setLoadingOtp(false);
      setCountdown(120); // 60 sec cooldown
    } catch (err) {
      console.log(err);
      setLoadingOtp(false);
      alert("Error sending OTP");
    }
  };

  const maskEmail = (email: string) => {
  return email.replace(/(.{3}).+(.{2}@.+)/, "$1***$2");
};


  const handleOtpVerify = async () => {

    if(otpVerified){
      alert("OTP Already Verified!");
    }else{

        try {
          const token = await getToken();

          await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/polls/verify-otp`,
            { otp },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setOtpVerified(true);
          alert("OTP verified!");
        } catch (err) {
          alert("Invalid OTP");
        }

    }


  };

const handleBiometric = async () => {
  try {
    // 🔍 Check hardware
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      Alert.alert("Error", "No biometric hardware found on this device");
      return;
    }

    // 🔍 Check enrolled biometrics
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      Alert.alert("Error", "No biometrics enrolled (add fingerprint/Face ID)");
      return;
    }

    // 🔍 Get supported types
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    let type = "Biometric";
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      type = "Fingerprint";
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      type = "Face ID";
    }

    // 🔐 Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Verify with ${type}`,
      fallbackLabel: "Use Passcode",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    if (result.success) {
      setBioVerified(true);
      Alert.alert("Success", `${type} verified!`);
    } else {
      Alert.alert("Failed", "Biometric authentication failed");
    }

  } catch (error) {
    console.log(error);
    Alert.alert("Error", "Biometric authentication error");
  }
};

  const handlePasswordVerify = async () => {
    try {
      setPasswordLoading(true);

      const token = await getToken();

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/verify-password`,
        { password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPasswordVerified(true);
      alert("Password verified!");
    } catch (err: any) {
      console.log(err?.response || err);
      alert("Incorrect password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const submitVote = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/${pollId}/vcast-vote`,
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
      router.replace(`/poll/${pollId}/results`); // Navigate to results
    } catch (err) {
      console.log(err);
      Alert.alert("Error submitting vote");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Complete Vote Verification</Text>

      {/* OTP Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>One Time Passcode - OTP</Text>

  

          {!otpVerified && (
            <TouchableOpacity
              onPress={sendOtp}
              disabled={countdown > 0}
              style={[styles.sendBtn, countdown > 0 && { opacity: 0.5 }]}
            >
              <Text style={styles.sendText}>
                {loadingOtp ? <ActivityIndicator size="small" color="#fff" /> : (countdown > 0 ? `Resend (${countdown}s)` : "Send OTP")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hint */}
        {otpSent && !otpVerified && (
            <Text style={styles.hint}>
              OTP sent to ****@***.**
              {/* OTP sent to {maskEmail(params.email as string)} */}
            </Text>
        )}

        {/* Input appears AFTER sending */}
        {otpSent && (
          <>

          {!otpVerified && (
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
          )}

            
      {otpVerified ? ( 
            <TouchableOpacity style={[styles.verifyBtn, otpVerified && { backgroundColor: "#16a34a" }]} onPress={handleOtpVerify}>
              <Text style={styles.verifyText}>
                 Verified ✅
              </Text>
            </TouchableOpacity>
      ) : (
            <TouchableOpacity style={styles.verifyBtn} onPress={handleOtpVerify}>
              <Text style={styles.verifyText}>
                Verify OTP
              </Text>
            </TouchableOpacity>
      )}
          </>
        )}
      </View>


            {/* Password Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This App Account Password</Text>

            {!passwordVerified && (
              <TextInput
                placeholder="Enter Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            )}
            <TouchableOpacity
              style={[
                styles.verifyBtn,
                passwordVerified && { backgroundColor: "#16a34a" },
              ]}
              onPress={handlePasswordVerify}
              disabled={passwordVerified || passwordLoading}
            >
              <Text style={styles.verifyText}>
                {passwordLoading
                  ? "Verifying..."
                  : passwordVerified
                  ? "Verified ✅"
                  : "Verify Password"}
              </Text>
            </TouchableOpacity>
          </View>


      {/* Biometric Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Biometric</Text>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            bioVerified && { backgroundColor: "#16a34a" },
          ]}
          onPress={handleBiometric}
          disabled={bioVerified}
        >
          <Text style={styles.verifyText}>
            {bioVerified ? "Verified ✅" : "Verify Biometric"}
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
    backgroundColor: "#4281A6",
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

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sendBtn: {
    backgroundColor: "#4281A6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sendText: {
    color: "#fff",
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
});