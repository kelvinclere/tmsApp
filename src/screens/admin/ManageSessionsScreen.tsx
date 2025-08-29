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
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE_URL } from "@env";

const PRIMARY_COLOR = "#ff7900";
const ACCENT_COLOR = "#ffaf40";
const CARD_BG = "#ffffff";

interface Session {
  end_time: string;
  session_id: string;
  session_type: string;
  start_time: string;
}

interface ApiResponse {
  success: boolean;
  response: Session[];
}

const formatSessionDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "N/A";
  const date = new Date(dateTimeString.replace(" ", "T"));
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ManageSessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionType, setSessionType] = useState("");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

  const checkNetwork = async (): Promise<boolean> => {
    try {
      const response = await fetch("https://www.google.com", { method: "HEAD" });
      return response.status === 200;
    } catch {
      return false;
    }
  };

  const fetchSessions = async (): Promise<void> => {
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured. Please check your .env file.");
      setLoading(false);
      return;
    }
    const url = `${trimmedBaseUrl}/api/v1/cemastea/sessions`;
    try {
      setLoading(true);
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        setSessions([]);
        setLoading(false);
        return;
      }
      const res = await fetch(url);
      if (!res.ok) {
        Alert.alert("Error", `Failed to fetch sessions. Status: ${res.status}`);
        setSessions([]);
        return;
      }
      const data: ApiResponse = await res.json();
      setSessions(data.response || []);
    } catch {
      Alert.alert("Error", "Failed to fetch sessions");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAddSession = async (): Promise<void> => {
    if (!sessionType || !startTime || !endTime) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (endTime.getTime() <= startTime.getTime()) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured. Please check your .env file.");
      return;
    }
    const payload = {
      session_type: sessionType,
      start_time: startTime.toISOString().slice(0, 19).replace("T", " "),
      end_time: endTime.toISOString().slice(0, 19).replace("T", " "),
    };
    const url = `${trimmedBaseUrl}/api/v1/cemastea/session/create`;
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        return;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.response || "Session created");
        resetForm();
        setModalVisible(false);
        fetchSessions();
      } else {
        Alert.alert("Error", data.response || "Failed to create session");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleDeleteSession = async (id: string): Promise<void> => {
    const trimmedBaseUrl = API_BASE_URL?.trim();
    if (!trimmedBaseUrl) {
      Alert.alert("Error", "API Base URL is not configured.");
      return;
    }
    const url = `${trimmedBaseUrl}/api/v1/cemastea/session/delete`;
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        Alert.alert("Error", "No internet connection");
        return;
      }
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Deleted", "Session deleted successfully");
        fetchSessions();
      } else {
        Alert.alert("Error", data.response || "Failed to delete session");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const resetForm = (): void => {
    setSessionType("");
    setStartTime(null);
    setEndTime(null);
  };

  const showDatePickerHandler = (pickerType: "start" | "end"): void => {
    setActivePicker(pickerType);
    setTempDate(
      pickerType === "start" && startTime
        ? startTime
        : pickerType === "end" && endTime
        ? endTime
        : new Date()
    );
    setShowDatePicker(true);
  };

  const handleDateChange = (_: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date): void => {
    setShowTimePicker(false);
    if (selectedTime) {
      const finalDateTime = new Date(tempDate);
      finalDateTime.setHours(selectedTime.getHours());
      finalDateTime.setMinutes(selectedTime.getMinutes());
      finalDateTime.setSeconds(0);
      if (activePicker === "start") {
        setStartTime(finalDateTime);
        if (!endTime || finalDateTime.getTime() >= endTime.getTime()) {
          const newEndTime = new Date(finalDateTime);
          newEndTime.setHours(finalDateTime.getHours() + 1);
          setEndTime(newEndTime);
        }
      } else if (activePicker === "end") {
        setEndTime(finalDateTime);
      }
    }
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "Select Date & Time";
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <LinearGradient colors={["#fff", "#f7f7f7"]} style={styles.container}>
      <Text style={styles.header}>Manage Sessions</Text>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={{ marginTop: 10 }}>Loading sessions...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.session_id}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="calendar-outline" size={56} color="#bbb" />
              <Text style={styles.emptyText}>No sessions found</Text>
              <TouchableOpacity onPress={fetchSessions} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <LinearGradient
              colors={["#fff", "#fef6f0"]}
              style={styles.sessionCard}
            >
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{item.session_type}</Text>
                <Text style={styles.sessionDetails}>
                  Start: {formatSessionDateTime(item.start_time)}
                </Text>
                <Text style={styles.sessionDetails}>
                  End: {formatSessionDateTime(item.end_time)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Confirm", "Delete this session?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDeleteSession(item.session_id),
                    },
                  ])
                }
              >
                <Ionicons name="trash" size={24} color="red" />
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
            <Text style={styles.modalTitle}>Add Session</Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="Session Name"
                value={sessionType}
                onChangeText={setSessionType}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Start Time</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => showDatePickerHandler("start")}
                >
                  <Text>{formatDateTime(startTime)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>End Time</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => showDatePickerHandler("end")}
                >
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
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleAddSession}
                >
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
  sessionCard: {
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
  sessionInfo: { flex: 1, marginRight: 10 },
  sessionTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR },
  sessionDetails: { fontSize: 14, color: "#555", marginTop: 3 },
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
  pickerContainer: { marginBottom: 15 },
  pickerLabel: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#999" },
  saveButton: { backgroundColor: PRIMARY_COLOR },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
