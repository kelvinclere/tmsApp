import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_CONFIG = {
  BASE_URL: "https://e1ff35ecf00f.ngrok-free.app", 
  ENDPOINTS: {
    SESSIONS: "/api/v1/cemastea/sessions",
    CREATE_SESSION: "/api/v1/cemastea/session/create",
    DELETE_SESSION: "/api/v1/cemastea/session/delete",
  },
};

const PRIMARY_COLOR = "#ff7900";

export default function ManageSessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionType, setSessionType] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const checkNetwork = async () => {
    try {
      const response = await fetch("https://www.google.com", { method: "HEAD" });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        setSessions([]);
        setLoading(false);
        return;
      }

      console.log("Fetching from:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SESSIONS}`);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SESSIONS}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setSessions(data || []);
      } else {
        // fallback: plain text response
        const text = await res.text();
        console.log("Raw text response:", text);

        // split lines & map into objects
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

        // skip header if present
        const rows = lines[0]?.toLowerCase().includes("session") ? lines.slice(1) : lines;

        const parsed = rows.map((line, idx) => {
          const parts = line.split(/\s{2,}|\t|,/); // split by 2+ spaces, tab, or comma
          return {
            id: idx.toString(),
            session_type: parts[0] || `Session ${idx + 1}`,
            start_time: parts[1] || "",
            end_time: parts[2] || "",
          };
        });

        setSessions(parsed);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      Alert.alert("Error", "Failed to fetch sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAddSession = async () => {
    if (!sessionType || !startTime || !endTime) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    const payload = {
      session_type: sessionType,
      start_time: startTime.toISOString().slice(0, 19).replace("T", " "),
      end_time: endTime.toISOString().slice(0, 19).replace("T", " "),
    };

    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        return;
      }

      console.log("Posting to:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_SESSION}`);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_SESSION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (isJson) {
        const data = await res.json();
        if (res.status === 200 || res.status === 201) {
          Alert.alert("Success", data.response || "Session created");
          resetForm();
          setModalVisible(false);
          fetchSessions();
        } else {
          Alert.alert("Error", data.response || "Failed to create session");
        }
      } else {
        const text = await res.text();
        console.error("Server response:", text);
        Alert.alert("Error", "Server returned an unexpected response");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        return;
      }

      console.log("Deleting from:", `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_SESSION}`);

      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_SESSION}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ id }),
      });

      const contentType = res.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (isJson) {
        const data = await res.json();
        if (res.status === 200) {
          Alert.alert("Deleted", "Session deleted successfully");
          fetchSessions();
        } else {
          Alert.alert("Error", data.response || "Failed to delete session");
        }
      } else {
        const text = await res.text();
        console.error("Server response:", text);
        Alert.alert("Error", "Server returned an unexpected response");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const resetForm = () => {
    setSessionType("");
    setStartTime(null);
    setEndTime(null);
  };

  const showDatePickerHandler = (pickerType: "start" | "end") => {
    setActivePicker(pickerType);

    if (pickerType === "start" && startTime) {
      setTempDate(startTime);
    } else if (pickerType === "end" && endTime) {
      setTempDate(endTime);
    } else {
      setTempDate(new Date());
    }
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);

    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);

      if (activePicker === "start") {
        setStartTime(finalDateTime);
        if (!endTime || finalDateTime >= endTime) {
          const newEndTime = new Date(finalDateTime);
          newEndTime.setHours(finalDateTime.getHours() + 1);
          setEndTime(newEndTime);
        }
      } else if (activePicker === "end") {
        setEndTime(finalDateTime);
      }
    }
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Select Date & Time";

    return date.toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Sessions</Text>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text>Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="warning-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No sessions found</Text>
              <TouchableOpacity onPress={fetchSessions} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{item.session_type}</Text>
                <Text style={styles.sessionDetails}>Start: {item.start_time}</Text>
                <Text style={styles.sessionDetails}>End: {item.end_time}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Confirm", "Delete this session?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => handleDeleteSession(item.id) },
                  ])
                }
              >
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Session</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Session Name"
                value={sessionType}
                onChangeText={setSessionType}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Start Time:</Text>
                <TouchableOpacity style={styles.input} onPress={() => showDatePickerHandler("start")}>
                  <Text>{formatDateTime(startTime)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>End Time:</Text>
                <TouchableOpacity style={styles.input} onPress={() => showDatePickerHandler("end")}>
                  <Text>{formatDateTime(endTime)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    resetForm();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddSession}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#666",
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  sessionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: { fontSize: 16, fontWeight: "bold" },
  sessionDetails: { fontSize: 14, color: "#666" },
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    justifyContent: "center",
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