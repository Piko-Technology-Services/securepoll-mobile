import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../../../src/lib/storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PollResults() {
  const { id } = useLocalSearchParams();
  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/polls/${id}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPoll(res.data);
    } catch (err) {
      console.log(err);
      alert("Error loading results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchResults();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (!poll) return <Text style={{ textAlign: "center" }}>No data</Text>;

  return (
<SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar style="dark" />

    <View style={styles.container}>
      {/* POLL HEADER */}
      <Text style={styles.title}>{poll.title}</Text>
      <Text style={styles.description}>{poll.description}</Text>

      <FlatList
        data={poll.categories}
        keyExtractor={(cat) => cat.id.toString()}
        renderItem={({ item: cat }) => {
          // total votes in category
          const totalVotes = cat.nominees.reduce(
            (sum: number, n: any) => sum + n.votes_count,
            0
          );

          return (
            <View style={styles.categoryBox}>
              <Text style={styles.categoryTitle}>{cat.name}</Text>

              {cat.nominees.map((nom: any) => {
                const percent =
                  totalVotes > 0
                    ? ((nom.votes_count / totalVotes) * 100).toFixed(1)
                    : 0;

                return (
                  <View key={nom.id} style={styles.nomineeRow}>
                    <View style={styles.nomineeHeader}>
                      <Text style={styles.nomineeName}>{nom.name}</Text>
                      <Text style={styles.voteCount}>
                        {nom.votes_count} votes
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                        //   { width: `${percent}%` },
                        ]}
                      />
                    </View>

                    <Text style={styles.percentText}>{percent}%</Text>
                  </View>
                );
              })}
            </View>
          );
        }}
      />
    </View>
</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 5,
  },
  description: {
    color: "#666",
    marginBottom: 20,
  },
  categoryBox: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  nomineeRow: {
    marginBottom: 12,
  },
  nomineeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nomineeName: {
    fontWeight: "600",
  },
  voteCount: {
    color: "#666",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginTop: 5,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#4281A6",
    borderRadius: 6,
  },
  percentText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});