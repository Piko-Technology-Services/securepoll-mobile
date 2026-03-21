// /app/index.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image, Modal, TextInput
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { getToken } from "../../src/lib/storage"; // your stored auth token

export default function Home() {
  const router = useRouter();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

// Fetch polls from API
  const fetchPolls = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/polls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(res.data); // assuming API returns array of polls
    } catch (err) {
      console.log(err);
      alert("Error fetching polls");
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchPolls();
  }, []);

const renderPoll = ({ item }: any) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() =>
      router.push({
        pathname: "/poll/[id]",
        params: { id: item.id.toString() },
      })
    }
  >
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardMeta}>{item.votes || 0} votes</Text>
    <TouchableOpacity
      style={styles.voteBtn}
      onPress={() =>
        router.push({
          pathname: "/poll/[id]",
          params: { id: item.id.toString() },
        })
      }
    >
      <Text style={styles.voteText}>Vote</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

  

  return (
    <View style={styles.container}>
      {/* 🔷 HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/react-logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>SecurePoll</Text>
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.profileIcon}>
            <Text style={{ color: "#fff" }}>U</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 🔍 SEARCH + FILTER */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search polls..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

        {loading ? (
          <ActivityIndicator size="large" style={{ flex: 1 }} />
        ) : (
          <>
            {/* 📋 POLL LIST */}
            <View style={styles.container}>
              <FlatList
                data={polls}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPoll}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            </View>
          </>
        )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-poll")}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* 👤 PROFILE MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>User Profile</Text>

            <Text>Name: User Name</Text>
            <Text>Email: john@test.com</Text>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileIcon: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  // SEARCH
  searchRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  filterBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },
  filterText: {
    color: "#fff",
  },

  // CARD
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardMeta: {
    color: "#666",
    marginBottom: 10,
  },
  voteBtn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  voteText: {
    color: "#fff",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  fab: {
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: "#111",
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
},
fabText: {
  color: "#fff",
  fontSize: 28,
  marginTop: -2,
},
});