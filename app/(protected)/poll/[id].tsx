import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../src/lib/storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";


export default function PollScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;

  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNominees, setSelectedNominees] = useState<any>({});

  const fetchPoll = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/polls/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoll(res.data);
    } catch (err) {
      console.log(err);
      alert("Error fetching poll");
    } finally {
      setLoading(false);
    }
  };

  const selectNominee = (categoryId: number, nomineeId: number) => {
    setSelectedNominees((prev: any) => ({
      ...prev,
      [categoryId]: nomineeId,
    }));
  };

  const handleSubmitVote = () => {

    console.log('Selected Nominees', selectedNominees);

    // Navigate to verification screen
    router.push({
      pathname: "/vote/verify",
      params: {
        pollId: id,
        selections: JSON.stringify(selectedNominees),
      },
    });
  };

  useEffect(() => {
    if (!id) return;
    fetchPoll();
  }, [id]);

  if (!id) return <Text style={{ flex: 1, textAlign: "center" }}>Invalid poll ID</Text>;
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (!poll) return <Text style={{ flex: 1, textAlign: "center" }}>Poll not found</Text>;

  return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <StatusBar style="dark" />
          <KeyboardAwareScrollView
                                contentContainerStyle={styles.container}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                enableOnAndroid={true}
                              >
            <Text style={styles.title}>{poll.title}</Text>
            <Text style={styles.description}>{poll.description}</Text>

            {poll.categories.map((cat: any) => (
              <View key={cat.id} style={styles.categoryBox}>
                <Text style={styles.categoryTitle}>{cat.name}</Text>
                {cat.nominees.map((nom: any) => {
                  const isSelected = selectedNominees[cat.id] === nom.id;
                  return (
                    <TouchableOpacity
                      key={nom.id}
                      style={[styles.nomineeBtn, isSelected && styles.selectedNominee]}
                      onPress={() => selectNominee(cat.id, nom.id)}
                    >
                      <Text style={[styles.nomineeText, isSelected && styles.selectedText]}>
                        {nom.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitVote}>
              <Text style={styles.submitText}>Submit Vote</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 20 },
  categoryBox: { marginBottom: 20 },
  categoryTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  nomineeBtn: {
    backgroundColor: "#4281A6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },
  nomineeText: { color: "#fff", fontWeight: "600" },
  selectedNominee: { backgroundColor: "#4CAF50" },
  selectedText: { color: "#fff" },
  submitBtn: {
    backgroundColor: "#4281A6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { color: "#fff", fontWeight: "600" },
});