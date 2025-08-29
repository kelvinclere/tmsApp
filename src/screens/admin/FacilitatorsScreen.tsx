import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card } from "react-native-paper";
import axios from "axios";
import { API_BASE_URL } from "@env";

interface Facilitator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  response: Facilitator[];
  message: string;
  total: number;
}

export default function FacilitatorsScreen() {
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilitators = async () => {
    try {
      setError(null);
      const response = await axios.get<ApiResponse>(
        `${API_BASE_URL}/v1/cemastea/facilitators`
      );

      if (response.data.success && Array.isArray(response.data.response)) {
        setFacilitators(response.data.response);
      } else {
        setFacilitators([]);
        setError("No facilitators found.");
      }
    } catch (err) {
      console.error("Error fetching facilitators:", err);
      setError("Failed to load facilitators. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilitators();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFacilitators();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Facilitators
      </Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : facilitators.length === 0 ? (
        <Text>No facilitators found.</Text>
      ) : (
        <FlatList
          data={facilitators}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">
                  {item.first_name} {item.last_name}
                </Text>
                <Text>Email: {item.email}</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { marginBottom: 16, fontWeight: "600" },
  card: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fafafa",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", marginBottom: 12 },
});
