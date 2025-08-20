import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import FloatingActionCard from "../../components/FloatingActionCard";

export default function ManageTrainingsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Manage Trainings</Text>
      <FloatingActionCard
        title="Training Actions"
        actions={[
          { label: "Create Training", onPress: () => console.log("Create Training") },
          { label: "View All Trainings", onPress: () => console.log("View Trainings") },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
