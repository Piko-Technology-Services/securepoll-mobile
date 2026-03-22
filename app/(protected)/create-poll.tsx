// /app/create-poll.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { getToken } from "../../src/lib/storage"; // function to get stored auth token
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function CreatePoll() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetimeStart, setDatetimeStart] = useState<Date>(new Date());
  const [datetimeEnd, setDatetimeEnd] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [categories, setCategories] = useState([
    { name: "", description: "", nominees: [""] },
  ]);
  const [votingMethod, setVotingMethod] = useState<string[]>(["otp"]);

  

  // Add new category
  const addCategory = () => {
    setCategories([...categories, { name: "", description: "", nominees: [""] }]);
  };

  // Add new nominee
  const addNominee = (catIndex: number) => {
    const updated = [...categories];
    updated[catIndex].nominees.push("");
    setCategories(updated);
  };

  // Handle change
  const handleCategoryChange = (catIndex: number, text: string) => {
    const updated = [...categories];
    updated[catIndex].name = text;
    setCategories(updated);
  };

    const handleCategoryDescriptionChange = (catIndex: number, text: string) => {
    const updated = [...categories];
    updated[catIndex].description = text;
    setCategories(updated);
  };

  const handleNomineeChange = (catIndex: number, nomIndex: number, text: string) => {
    const updated = [...categories];
    updated[catIndex].nominees[nomIndex] = text;
    setCategories(updated);
  };

  const formatDateTime = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
};

  const handleSubmit = async () => {

    console.log({ title, description, datetimeStart, datetimeEnd, categories, votingMethod });

    // if (!title || categories.some(cat => !cat.name || cat.nominees.some(n => !n))) {
    //   alert("Please fill all fields");
    //   return;
    // }

    try {
      const token = await getToken(); // retrieve auth token

      const payload = {
        title,
        description,
        datetime_start: formatDateTime(datetimeStart),
        datetime_end: formatDateTime(datetimeEnd),
        status: "draft", // or selected status
        visibility: "public", // or selected visibility
        voting_method: votingMethod, // ["otp","biometric"]
        categories: categories.map(cat => ({
            name: cat.name,
            description: cat.description || "",
            nominees: cat.nominees.map(n => ({
            name: n})),
        })),
        };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/create-poll`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Poll created successfully!");
      router.back();
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      alert("Error creating poll");
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Poll</Text>

      <TextInput
        placeholder="Poll Title"
        placeholderTextColor="#999"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        placeholderTextColor="#999"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      {/* Start DateTime */}
<TouchableOpacity
  style={styles.input}
  onPress={() => setShowStartPicker(true)}
>
  <Text>
    Poll Start -
    {datetimeStart
      ? ` ` + datetimeStart.toLocaleString()
      : "Select Poll Start Date & Time"}
  </Text>
</TouchableOpacity>

{showStartPicker && (
  <View style={styles.pickerContainer}>
    <DateTimePicker
      value={ datetimeStart || new Date()}
      mode="datetime"
      display="spinner"
      themeVariant="light"
      onChange={(event, selectedDate) => {
        if (selectedDate) setDatetimeStart(selectedDate);
      }}
    />

    {/* ✅ ACTION BUTTONS */}
    <View style={styles.pickerActions}>
      <TouchableOpacity onPress={() => setShowStartPicker(false)}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowStartPicker(false)}>
        <Text style={styles.done}>Done</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

    {/* End DateTime */}
<TouchableOpacity
  style={styles.input}
  onPress={() => setShowStartPicker(true)}
>
  <Text>
    Poll End -  
    {datetimeEnd
      ? ` ` + datetimeEnd.toLocaleString()
      : "Select Poll End Date & Time"}
  </Text>
</TouchableOpacity>

{showEndPicker && (
  <View style={styles.pickerContainer}>
    <DateTimePicker
      value={datetimeEnd || new Date()}
      mode="datetime"
      display="spinner"
      themeVariant="light"
      onChange={(event, selectedDate) => {
        if (selectedDate) setDatetimeEnd(selectedDate);
      }}
    />

    <View style={styles.pickerActions}>
      <TouchableOpacity onPress={() => setShowEndPicker(false)}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setShowEndPicker(false)}>
        <Text style={styles.done}>Done</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      {categories.map((cat, catIndex) => (
        <View key={catIndex} style={styles.categoryBox}>
          <TextInput
            placeholder={`Category ${catIndex + 1} Name`}
            style={styles.input}
            value={cat.name}
            onChangeText={text => handleCategoryChange(catIndex, text)}
          />

           <TextInput
            placeholder={`Category ${catIndex + 1} Description`}
            style={styles.input}
            value={cat.description}
            onChangeText={text => handleCategoryDescriptionChange(catIndex, text)}
          />
          {cat.nominees.map((nom, nomIndex) => (
            <TextInput
              key={nomIndex}
              placeholder={`Nominee ${nomIndex + 1}`}
              style={styles.input}
              value={nom}
              onChangeText={text => handleNomineeChange(catIndex, nomIndex, text)}
            />
          ))}
          <TouchableOpacity onPress={() => addNominee(catIndex)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add Nominee</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={addCategory} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add Category</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Poll</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4281A6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  categoryBox: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 12,
  },
  addBtn: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  addBtnText: {
    color: "#111",
    fontWeight: "600",
  },
   pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cancel: {
    color: "#888",
    fontWeight: "500",
  },
  done: {
    color: "#111",
    fontWeight: "700",
  },
});