import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import FloatingActionCard from "../../components/FloatingActionCard";

export default function FacilitatorsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="titleLarge">Facilitators</Text>
      <FloatingActionCard
        title="Facilitator Actions"
        actions={[
          { label: "Create Facilitator", onPress: () => console.log("Create Facilitator") },
          { label: "View Facilitators", onPress: () => console.log("View Facilitators") },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
