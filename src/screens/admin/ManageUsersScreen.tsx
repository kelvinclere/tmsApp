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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "#ff7900";

export default function ManageUsersScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [role, setRole] = useState("user");
  const [sne, setSne] = useState(false);
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://e1ff35ecf00f.ngrok-free.app/v1/cemastea/users"
      );
      const result = await response.json();

      console.log("Fetched users response:", result);

      // Handle wrapped response
      const usersArray = Array.isArray(result) ? result : result.data;
      setUsers(usersArray || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add User
  const handleAddUser = async () => {
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
      const response = await fetch(
        "https://e1ff35ecf00f.ngrok-free.app/v1/cemastea/add-educator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      if (response.status === 201) {
        const data = await response.json();
        Alert.alert("Success", data.message || "User created successfully");
        setModalVisible(false);
        resetForm();
        fetchUsers();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create user");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Delete user
  const handleDeleteUser = async (id_number: string) => {
    try {
      const response = await fetch(
        "https://e1ff35ecf00f.ngrok-free.app/v1/cemastea/user",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_number }),
        }
      );

      if (response.status === 200) {
        Alert.alert("Deleted", "User deleted successfully");
        fetchUsers();
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete user");
      }
    } catch (error) {
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
    <View style={styles.container}>
      <Text style={styles.header}>Manage Users</Text>

      <FlatList
        data={users}
        keyExtractor={(item, index) =>
          item?.id_number?.toString() || `${index}`
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View>
              <Text style={styles.userName}>
                {item.first_name} {item.last_name}
              </Text>
              <Text style={styles.userDetails}>{item.email}</Text>
              <Text style={styles.userDetails}>
                {item.role} • {item.designation}
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
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add New User</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Designation"
                value={designation}
                onChangeText={setDesignation}
              />
              <TextInput
                style={styles.input}
                placeholder="Role (user, teacher, super_admin, facilitator)"
                value={role}
                onChangeText={setRole}
              />

              {/* Sne toggle */}
              <View style={styles.toggleRow}>
                <Text style={styles.label}>SNE:</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    sne ? styles.toggleActive : styles.toggleInactive,
                  ]}
                  onPress={() => setSne(true)}
                >
                  <Text style={styles.toggleText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !sne ? styles.toggleActive : styles.toggleInactive,
                  ]}
                  onPress={() => setSne(false)}
                >
                  <Text style={styles.toggleText}>No</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="ID Number"
                value={idNumber}
                onChangeText={setIdNumber}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddUser}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  userName: { fontSize: 16, fontWeight: "bold" },
  userDetails: { fontSize: 14, color: "#666" },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 50,
    padding: 18,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  toggleActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  toggleInactive: {
    backgroundColor: "#ddd",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#999" },
  saveButton: { backgroundColor: PRIMARY_COLOR },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
