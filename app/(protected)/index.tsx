// /app/index.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image, Modal, TextInput, Alert
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { getToken } from "../../src/lib/storage";
import { Ionicons } from "@expo/vector-icons";
// import { SafeAreaView } from "react-native-safe-area-context";



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

  async function handleDeletePoll(id: string): Promise<void> {

    const confirm = await new Promise<boolean>((resolve) => {
      // Use React Native's Alert API for confirmation
      // (Alert is a global import in React Native)
      Alert.alert(
          "Delete Poll",
          "Are you sure you want to delete this poll?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Delete", style: "destructive", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
    });
    if (!confirm) return;

    const token = await getToken();
    // Call API to delete poll
    axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/delete-poll/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      // Remove poll from state
      setPolls((prev) => prev.filter((poll) => poll.id !== id));
      alert("Poll deleted successfully");
    })
    .catch((err) => {
      console.log(err);
      alert("Error deleting poll");
    });
  }

  async function handlePublishPoll(id: string): Promise<void> {

    const confirm = await new Promise<boolean>((resolve) => {
      // Use React Native's Alert API for confirmation
      // (Alert is a global import in React Native)
      Alert.alert(
          "Publish Poll",
          "Are you sure you want to publish this poll?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Publish", style: "destructive", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
    });
    if (!confirm) return;

    const token = await getToken();
    // Call API to publish poll
    axios.post(
      `${process.env.EXPO_PUBLIC_API_URL}/publish-poll/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    )
      .then(() => {
        alert("Poll published successfully");
      })
      .catch((err) => {
        console.log(err);
        alert("Error publishing poll" + err.message);
      });
  }

  const renderPoll = ({ item }: any) => {
    
    const formatDate = (date: string) => {
      return new Date(date).toLocaleString();
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "#16a34a"; // green
        case "closed":
          return "#dc2626"; // red
        default:
          return "#f59e0b"; // draft = orange
      }
    };
    

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/poll/[id]",
            params: { id: item.id.toString() },
          })
        }
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* DATES */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            Start: {formatDate(item.datetime_start)}
          </Text>
          <Text style={styles.dateText}>
            End: {formatDate(item.datetime_end)}
          </Text>
        </View>

        {/* ACTIONS */}
  <View style={styles.actionsRow}>

  {/* Delete */}
    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeletePoll(item.id)}>
      <Ionicons name="trash-outline" size={18} color="#dc2626" />
    </TouchableOpacity>

    {/* Edit */}
    <TouchableOpacity style={styles.iconBtn}>
      <Ionicons name="create-outline" size={18} color="#333" />
    </TouchableOpacity>

    {/* see results */}
    <TouchableOpacity
      style={styles.iconBtn}
      onPress={() =>
        router.push({
          pathname: "/poll/[id]/results",
          params: { id: item.id.toString() },
        })
      }
    >
      {/* <Text style={{color: '#fff'}}>Preview</Text> */}
      <Ionicons name="eye-outline" size={18} color="#333" />

    </TouchableOpacity>


    {/* Share */}
    <TouchableOpacity style={styles.publishBtn} 
        onPress={() => handlePublishPoll(item.id)}
      >
      <Text style={{color: '#fff'}}>Publish</Text>
      <Ionicons name="share-social-outline" size={18} color="#fff" />
    </TouchableOpacity>




  </View>
      </TouchableOpacity>
    );
  };

  

  return (

    // <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>

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
            <View>
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

    //  </SafeAreaView>


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
    alignItems: "center", // ensure items are aligned in a row
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  filterBtn: {
    backgroundColor: "#4281A6",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
    height: 44, // match input height for row alignment
    alignItems: "center",
  },
  filterText: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#555",
  },

  dateRow: {
    marginTop: 10,
  },

  dateText: {
    fontSize: 12,
    color: "#888",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 15,
  },

  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },

  actionText: {
    fontSize: 16,
  },

iconBtn: {
  width: 38,
  height: 38,
  borderRadius: 10,
  backgroundColor: "#f5f5f5",
  alignItems: "center",
  justifyContent: "center",
},

voteBtn: {
  backgroundColor: "#4281A6",
  paddingHorizontal: 16,
  height: 38,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row", // make Vote button content in a row
  gap: 6,
},

publishBtn: {
  backgroundColor: "#4CAF50",
  paddingHorizontal: 16,
  height: 38,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row", // make Vote button content in a row
  gap: 6,
},

  voteText: {
    color: "#fff",
    fontWeight: "600",
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
    backgroundColor: "#4281A6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  fab: {
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: "#4281A6",
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