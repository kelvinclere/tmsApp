import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "@env";

const PRIMARY_COLOR = "#ff7900";
const CARD_BG = "#ffffff";

interface User {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  designation?: string;
  role?: string;
  sne?: boolean;
  id_number: string;
}

export default function ManageUsersScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("user");
  const [sne, setSne] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");

  const fetchUsers = async () => {
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured. Please check your .env file.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const url = `${trimmedBaseUrl}/v1/cemastea/users`;
      const response = await fetch(url);
      const result = await response.json();
      const usersArray = Array.isArray(result.response) ? result.response : [];
      setUsers(usersArray);
    } catch {
      Alert.alert("Error", "Failed to fetch users. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured. Please check your .env file.");
      return;
    }
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      designation,
      role,
      sne,
      id_number: idNumber,
      password,
    };
    try {
      const url = `${trimmedBaseUrl}/v1/cemastea/add-educator`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok || response.status === 201) {
        const data = await response.json();
        Alert.alert("Success", data.message || "User created successfully");
        setModalVisible(false);
        resetForm();
        fetchUsers();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create user");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleDeleteUser = async (id_number: string) => {
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured. Please check your .env file.");
      return;
    }
    try {
      const url = `${trimmedBaseUrl}/v1/cemastea/user`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_number }),
      });
      if (response.ok || response.status === 200) {
        Alert.alert("Deleted", "User deleted successfully");
        fetchUsers();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete user");
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setDesignation("");
    setRole("user");
    setSne(false);
    setIdNumber("");
    setPassword("");
  };

  return (
    <LinearGradient colors={["#fff", "#f7f7f7"]} style={styles.container}>
      <Text style={styles.header}>Manage Users</Text>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={{ marginTop: 10 }}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id?.toString() || item.user_id}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="people-outline" size={56} color="#bbb" />
              <Text style={styles.emptyText}>No users found</Text>
              <TouchableOpacity onPress={fetchUsers} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <LinearGradient colors={["#fff", "#fef6f0"]} style={styles.userCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                  {item.first_name} {item.last_name}
                </Text>
                <Text style={styles.userDetails}>{item.email}</Text>
                <Text style={styles.userDetails}>
                  {(item.role || "User")} • {(item.designation || "N/A")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Confirm", "Delete this user?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeleteUser(item.id_number),
                    },
                  ])
                }
              >
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </LinearGradient>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New User</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
              <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
              <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <TextInput style={styles.input} placeholder="Designation" value={designation} onChangeText={setDesignation} />
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={styles.picker}>
                  <Picker.Item label="User" value="user" />
                  <Picker.Item label="Teacher" value="teacher" />
                  <Picker.Item label="Super Admin" value="super_admin" />
                  <Picker.Item label="Facilitator" value="facilitator" />
                </Picker>
              </View>
              <View style={styles.toggleRow}>
                <Text style={styles.label}>SNE:</Text>
                <TouchableOpacity
                  style={[styles.toggleButton, sne ? styles.toggleActive : styles.toggleInactive]}
                  onPress={() => setSne(true)}
                >
                  <Text style={styles.toggleText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !sne ? styles.toggleActive : styles.toggleInactive]}
                  onPress={() => setSne(false)}
                >
                  <Text style={styles.toggleText}>No</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder="ID Number" value={idNumber} onChangeText={setIdNumber} />
              <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddUser}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 15, color: "#333" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#777", marginTop: 10 },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userName: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR },
  userDetails: { fontSize: 14, color: "#555", marginTop: 3 },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 50,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
    marginBottom: 15,
  },
  label: { fontSize: 15, marginRight: 10, fontWeight: "600" },
  pickerWrapper: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  picker: { width: "100%" },
  toggleRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  toggleButton: { padding: 10, borderRadius: 6, marginHorizontal: 5 },
  toggleActive: { backgroundColor: PRIMARY_COLOR },
  toggleInactive: { backgroundColor: "#ddd" },
  toggleText: { color: "#fff", fontWeight: "bold" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 5 },
  cancelButton: { backgroundColor: "#999" },
  saveButton: { backgroundColor: PRIMARY_COLOR },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
