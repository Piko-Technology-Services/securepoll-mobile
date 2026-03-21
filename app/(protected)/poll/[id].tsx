// /app/poll/[id].tsx
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../src/lib/storage";

export default function PollScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string; // <-- dynamic route id
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const castVote = async (categoryId: number, nomineeId: number) => {
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/${id}/vote`,
        { category_id: categoryId, nominee_id: nomineeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Vote cast successfully!");
    } catch (err) {
      console.log(err);
      alert("Error casting vote");
    }
  };

  useEffect(() => {
    if (!id) return; // avoid undefined
    fetchPoll();
  }, [id]);

  if (!id) return <Text style={{ flex: 1, textAlign: "center" }}>Invalid poll ID</Text>;
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (!poll) return <Text style={{ flex: 1, textAlign: "center" }}>Poll not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{poll.title}</Text>
      <Text style={styles.description}>{poll.description}</Text>

      <FlatList
        data={poll.categories}
        keyExtractor={(cat) => cat.id.toString()}
        renderItem={({ item: cat }) => (
          <View style={styles.categoryBox}>
            <Text style={styles.categoryTitle}>{cat.name}</Text>
            {cat.nominees.map((nom: any) => (
              <TouchableOpacity
                key={nom.id}
                style={styles.nomineeBtn}
                onPress={() => castVote(cat.id, nom.id)}
              >
                <Text style={styles.nomineeText}>{nom.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  description: { fontSize: 16, marginBottom: 20 },
  categoryBox: { marginBottom: 20 },
  categoryTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  nomineeBtn: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    alignItems: "center",
  },
  nomineeText: { color: "#fff", fontWeight: "600" },
});