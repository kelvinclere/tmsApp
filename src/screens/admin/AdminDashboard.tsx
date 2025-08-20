import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    users: 120,
    trainings: 25,
    facilitators: 18,
    sessions: 42,
  });

  useEffect(() => {
    // Simulate API fetching
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating color="#ff7900" size="large" />
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* KPI Cards */}
      <View style={styles.cardRow}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.metric}>{data.users}</Text>
            <Text>Users</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.metric}>{data.trainings}</Text>
            <Text>Trainings</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.cardRow}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.metric}>{data.facilitators}</Text>
            <Text>Facilitators</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.metric}>{data.sessions}</Text>
            <Text>Sessions</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Reports Section */}
      <Card style={styles.reportCard}>
        <Card.Title title="Recent Reports" />
        <Card.Content>
          <Text>- 5 new trainings completed last week</Text>
          <Text>- 12 new users registered</Text>
          <Text>- 3 sessions scheduled for this week</Text>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.reportCard}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Text>✔ Create Training</Text>
          <Text>✔ Add New User</Text>
          <Text>✔ Assign Facilitator</Text>
          <Text>✔ Review Sessions</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 16,
    color: "#ff7900",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 2,
  },
  metric: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff7900",
  },
  reportCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "white",
    elevation: 2,
    paddingBottom: 10,
  },
});
